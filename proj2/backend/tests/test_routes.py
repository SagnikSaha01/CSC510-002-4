import json
import pytest
from unittest.mock import MagicMock, patch

# --- Test GET /api/restaurants ---


def test_get_restaurants(client, mocker):
    """
    Test the GET /api/restaurants endpoint.
    We will mock the supabase response.
    """
    # --- THIS IS THE FIX ---
    # Import the module here so we can use it in our assertions
    import restaurantRoutes

    # ---------------------

    # 1. Define the fake data we want supabase to return
    mock_data = [
        {"id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", "name": "The Rustic Olive"},
        {"id": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2", "name": "The Daily Grind"},
    ]

    # 2. Mock the final supabase response object
    mock_response = MagicMock()
    mock_response.data = mock_data

    # 3. Create a "chain mock" to simulate the .select().execute() calls
    mock_chain = MagicMock()
    mock_chain.select.return_value.execute.return_value = mock_response

    # 4. Patch the *start* of the chain: 'supabase.table'
    #    Tell it to return our mock_chain when it's called.
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_chain)

    # 5. Make the simulated request
    response = client.get("/api/restaurants")

    # 6. Check our assertions
    assert response.status_code == 200
    assert response.json == mock_data

    # Also, we can check if our mocks were called correctly
    # This line now works because we imported restaruantRoutes
    restaurantRoutes.supabase.table.assert_called_with("restaurants")
    mock_chain.select.assert_called_with("*")
    mock_chain.select.return_value.execute.assert_called_once()


# --- Test POST /api/restaurants ---


def test_create_restaurant(client, mocker):
    """
    Test the POST /api/restaurants endpoint.
    This is more complex as it mocks two insert calls.
    """
    # 1. Define the fake data we will send *in* the POST request
    new_restaurant_payload = {
        "name": "The Test Spot",
        "address": "999 Test Ave",
        "banner_image_url": "/banners/test.png",
        "menu_items": [{"name": "Test Dish 1", "price": 10.99, "category": "Test"}],
    }

    # 2. Define the fake data we expect back from Supabase
    #    First, the response for the restaurant insert
    mock_restaurant_response = MagicMock()
    mock_restaurant_response.data = [
        {
            "id": "t1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1",  # Fake generated UUID
            "name": "The Test Spot",
            "address": "999 Test Ave",
            "banner_image_url": "/banners/test.png",
        }
    ]

    #    Second, the response for the menu_items insert
    mock_menu_response = MagicMock()
    mock_menu_response.data = [
        {
            "id": "m1m1m1m1-m1m1-m1m1-m1m1-m1m1m1m1m1m1",
            "name": "Test Dish 1",
            "price": 10.99,
            "category": "Test",
            "restaurant_id": "t1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1",
        }
    ]

    # 3. Patch the 'routes.supabase' object
    #    We use 'side_effect' to return *different* values on subsequent calls
    mock_table_chain = MagicMock()
    mock_table_chain.insert.return_value.execute.side_effect = [
        mock_restaurant_response,  # First call (restaurants)
        mock_menu_response,  # Second call (menu_items)
    ]
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_table_chain)

    # 4. Make the simulated POST request
    response = client.post("/api/restaurants", json=new_restaurant_payload)

    # 5. Check our assertions
    assert response.status_code == 201
    assert response.json["name"] == "The Test Spot"
    assert response.json["id"] == "t1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1"
    assert len(response.json["menu_items"]) == 1
    assert response.json["menu_items"][0]["name"] == "Test Dish 1"


def test_get_restaurant_details(client, mocker):
    """
    Test the GET /api/restaurant/<id> endpoint for a successful fetch.
    """
    import restaurantRoutes

    # 1. Define the fake data for one restaurant
    mock_restaurant_id = "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"
    mock_data_dict = {
        "id": mock_restaurant_id,
        "name": "The Rustic Olive",
        "address": "123 Main St, Raleigh, NC",
        "menu_items": [{"id": "m1m1m1", "name": "Margherita Pizza", "price": 14.50}],
    }

    # 2. Mock the final response. Data is now a LIST.
    mock_response = MagicMock()
    mock_response.data = [mock_data_dict]  # <-- FIX

    # 3. Create the correct mock chain (no .single())
    mock_chain = MagicMock()
    mock_chain.select.return_value.eq.return_value.execute.return_value = (
        mock_response  # <-- FIX
    )

    # 4. Patch the 'supabase.table' call
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_chain)

    # 5. Make the simulated request
    response = client.get(f"/api/restaurant/{mock_restaurant_id}")

    # 6. Check our assertions
    assert response.status_code == 200
    # The final JSON is the dict, which is correct
    assert response.json == mock_data_dict

    # 7. Check mock calls
    restaurantRoutes.supabase.table.assert_called_with("restaurants")
    mock_chain.select.assert_called_with("*, menu_items(*)")
    mock_chain.select.return_value.eq.assert_called_with("id", mock_restaurant_id)
    # Check that .execute() was called (not .single())
    mock_chain.select.return_value.eq.return_value.execute.assert_called_once()


# --- Test GET /api/restaurants (404 Not Found) ---


def test_get_restaurants_404_not_found(client, mocker):
    """
    Test the GET /api/restaurants endpoint when no restaurants are found (empty list).
    """
    import restaurantRoutes  # Import the module for assertions

    # 1. Mock a response with empty data
    mock_response = MagicMock()
    mock_response.data = []  # This will trigger the 'if response.data:' check to fail

    # 2. Create the mock chain
    mock_chain = MagicMock()
    mock_chain.select.return_value.execute.return_value = mock_response

    # 3. Patch the table using the *correct* spelling
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_chain)

    # 4. Make the request
    response = client.get("/api/restaurants")

    # 5. Check for the 404 error
    assert response.status_code == 404
    assert response.json == {"error": "No restaurants found"}


# --- Test GET /api/restaurant/<id> (404 Not Found) ---


def test_get_restaurant_details_404_not_found(client, mocker):
    """
    Test the GET /api/restaurant/<id> endpoint when the ID does not exist.
    """
    import restaurantRoutes

    mock_restaurant_id = "00000000-0000-0000-0000-000000000000"

    # 1. Mock a response with empty data
    mock_response = MagicMock()
    mock_response.data = []

    # 2. Create the correct mock chain (no .single())
    mock_chain = MagicMock()
    mock_chain.select.return_value.eq.return_value.execute.return_value = (
        mock_response  # <-- FIX
    )

    # 3. Patch the table
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_chain)

    # 4. Make the request
    response = client.get(f"/api/restaurant/{mock_restaurant_id}")

    # 5. Check for the 404 error
    assert response.status_code == 404
    data = response.get_json()
    assert data == {"error": "Restaurant not found"}


# --- Test any route (500 Server Error) ---


def test_get_restaurants_500_server_error(client, mocker):
    """
    Test any endpoint for a 500 Internal Server Error when the database fails.
    We'll use the GET /api/restaurants endpoint as an example.
    """
    import restaurantRoutes  # Import the module for assertions

    # 1. Create a mock chain that *raises an exception*
    mock_chain = MagicMock()
    mock_chain.select.return_value.execute.side_effect = Exception(
        "Simulated database connection error"
    )

    # 2. Patch the table
    mocker.patch("restaurantRoutes.supabase.table", return_value=mock_chain)

    # 3. Make the request
    response = client.get("/api/restaurants")

    # 4. Check for the 500 error
    assert response.status_code == 500

    # --- THIS IS THE FIX ---
    # 1. Use response.get_json()
    data = response.get_json()
    # 2. Assert the *exact* error message your app sends
    assert data["error"] == "Simulated database connection error"

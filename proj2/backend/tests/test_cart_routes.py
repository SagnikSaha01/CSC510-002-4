import pytest
import json
from unittest.mock import MagicMock

# --- Fixtures (from conftest.py) ---
# We assume conftest.py provides 'client' and 'mocker'

# ----------------------------------------------------
# --- Shopping Cart Routes (cartRoutes.py) Tests ---
# ----------------------------------------------------

@pytest.fixture
def cart_payload():
    """A reusable payload for cart tests."""
    return {
        "user_id": "8a8a8a8a-8a8a-8a8a-8a8a-8a8a8a8a8a8a",
        "menu_item_id": "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
        "quantity": 1
    }

def test_add_to_cart_success(client, mocker, cart_payload):
    """
    Test POST /api/cart (Success 201)
    """
    import cartRoutes
    
    mock_response_data = {
        "id": "c1c1c1", 
        "user_id": cart_payload['user_id'],
        "menu_item_id": cart_payload['menu_item_id'],
        "quantity": 1
    }
    mock_response = MagicMock()
    mock_response.data = [mock_response_data]
    
    mock_upsert_chain = MagicMock()
    mock_upsert_chain.upsert.return_value.execute.return_value = mock_response
    
    mocker.patch('cartRoutes.supabase.table', return_value=mock_upsert_chain)
    
    response = client.post('/api/cart', json=cart_payload)
    
    assert response.status_code == 201
    assert response.json == mock_response_data
    # Check that upsert was called with the correct conflict rule
    mock_upsert_chain.upsert.assert_called_with(
        cart_payload, 
        on_conflict='user_id, menu_item_id'
    )

def test_add_to_cart_400_bad_request(client):
    """
    Test POST /api/cart (Bad Request 400)
    """
    response = client.post('/api/cart', json={"user_id": "123"}) # Missing menu_item_id
    assert response.status_code == 400
    assert response.get_json() == {"error": "user_id and menu_item_id are required"}

def test_get_cart_success(client, mocker, cart_payload):
    """
    Test GET /api/cart (Success 200)
    """
    mock_data = [{
        "id": "c1c1c1",
        "quantity": 1,
        "menu_items": {"id": cart_payload['menu_item_id'], "name": "Pizza", "price": 10.99}
    }]
    mock_response = MagicMock()
    mock_response.data = mock_data
    
    mock_select_chain = MagicMock()
    mock_select_chain.select.return_value.eq.return_value.execute.return_value = mock_response
    
    mocker.patch('cartRoutes.supabase.table', return_value=mock_select_chain)
    
    response = client.get(f"/api/cart?user_id={cart_payload['user_id']}")
    
    assert response.status_code == 200
    assert response.json == mock_data
    mock_select_chain.select.return_value.eq.assert_called_with('user_id', cart_payload['user_id'])

def test_get_cart_empty(client, mocker, cart_payload):
    """
    Test GET /api/cart (Success 200, empty)
    """
    mock_response = MagicMock()
    mock_response.data = [] # Empty cart
    
    mock_select_chain = MagicMock()
    mock_select_chain.select.return_value.eq.return_value.execute.return_value = mock_response
    
    mocker.patch('cartRoutes.supabase.table', return_value=mock_select_chain)
    
    response = client.get(f"/api/cart?user_id={cart_payload['user_id']}")
    
    assert response.status_code == 200
    assert response.json == []

def test_remove_from_cart_success(client, mocker, cart_payload):
    """
    Test DELETE /api/cart/items/<id> (Success 204)
    """
    import cartRoutes
    
    mock_response = MagicMock()
    mock_response.data = [{"id": "c1c1c1"}] # Supabase returns the deleted item
    
    mock_delete_chain = MagicMock()
    mock_delete_chain.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    mocker.patch('cartRoutes.supabase.table', return_value=mock_delete_chain)
    
    url = f"/api/cart/items/{cart_payload['menu_item_id']}?user_id={cart_payload['user_id']}"
    response = client.delete(url)
    
    assert response.status_code == 204
    
    # --- THIS IS THE FIX ---
    # We must assert the chain of calls correctly.
    
    # 1. Assert the FIRST .eq() call
    first_eq_call = mock_delete_chain.delete.return_value.eq
    first_eq_call.assert_called_with('user_id', cart_payload['user_id'])
    
    # 2. Assert the SECOND .eq() call (on the return value of the first)
    second_eq_call = first_eq_call.return_value.eq
    second_eq_call.assert_called_with('menu_item_id', cart_payload['menu_item_id'])

def test_remove_from_cart_404(client, mocker, cart_payload):
    """
    Test DELETE /api/cart/items/<id> (Not Found 404)
    """
    mock_response = MagicMock()
    mock_response.data = [] # Nothing was deleted
    
    mock_delete_chain = MagicMock()
    mock_delete_chain.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    mocker.patch('cartRoutes.supabase.table', return_value=mock_delete_chain)
    
    url = f"/api/cart/items/{cart_payload['menu_item_id']}?user_id={cart_payload['user_id']}"
    response = client.delete(url)
    
    assert response.status_code == 404
    assert response.get_json() == {"error": "Item not found in cart"}

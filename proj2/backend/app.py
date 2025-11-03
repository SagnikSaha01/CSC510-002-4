import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS for all routes, allowing the frontend to connect
CORS(app)

# Initialize the Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


@app.route("/")
def home():
    """A simple route to test if the server is running."""
    return jsonify({"message": "Welcome to the Vibe Eats API!"})


@app.route("/api/restaurants")
def get_restaurants():
    """
    Retrieves all restaurants from the database.
    """
    try:
        # 'restaurants' is the table name
        response = supabase.table('restaurants').select('*').execute()
        
        if response.data:
            return jsonify(response.data)
        return jsonify({"error": "No restaurants found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/restaurant/<uuid:restaurant_id>")
def get_restaurant_details(restaurant_id):
    """
    Retrieves a single restaurant and its associated menu items.
    """
    try:
        # Select all columns from 'restaurants' (*)
        # and all associated columns from 'menu_items' (menu_items(*))
        response = supabase.table('restaurants') \
                           .select('*, menu_items(*)') \
                           .eq('id', str(restaurant_id)) \
                           .single() \
                           .execute()

        if response.data:
            return jsonify(response.data)
        return jsonify({"error": "Restaurant not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/recommendations", methods=["POST"])
def get_ai_recommendations():
    """
    Generates personalized restaurant/dish recommendations based on user mood.
    Uses OpenAI to analyze the mood text and returns tailored recommendations.
    """
    try:
        data = request.get_json()
        mood_text = data.get("mood", "")

        if not mood_text:
            return jsonify({"error": "Mood text is required"}), 400

        # Get all restaurants from the database
        restaurants_response = supabase.table('restaurants').select('*, menu_items(*)').execute()

        if not restaurants_response.data:
            # If no restaurants in database, return error
            return jsonify({"error": "No restaurants available in database"}), 404

        # Prepare restaurant data for OpenAI
        restaurant_data = restaurants_response.data

        # Create a list of all available dishes from the database
        all_dishes = []
        dish_counter = 1
        for restaurant in restaurant_data:
            restaurant_name = restaurant.get('name', 'Unknown Restaurant')
            restaurant_address = restaurant.get('address', '')

            if 'menu_items' in restaurant and restaurant['menu_items']:
                for item in restaurant['menu_items']:
                    all_dishes.append({
                        'id': dish_counter,
                        'restaurant': restaurant_name,
                        'address': restaurant_address,
                        'name': item.get('name', ''),
                        'description': item.get('description', ''),
                        'category': item.get('category', ''),
                        'price': float(item.get('price', 0)),
                        'image_url': item.get('image_url', '')
                    })
                    dish_counter += 1

        # Create a prompt for OpenAI to analyze mood and recommend dishes
        prompt = f"""You are a food recommendation AI for "Vibe Eats". Based on the user's mood/feeling, recommend personalized restaurant dishes.

User's mood: "{mood_text}"

Available restaurants and dishes:
{format_restaurants_for_ai(restaurant_data)}

Task: Analyze the user's mood and select 8-10 dishes from the list above that would best match their current feeling. Consider:
- Comfort foods for sad/stressed moods
- Light/healthy options for energetic/motivated moods
- Adventurous/exotic foods for excited/curious moods
- Familiar favorites for nostalgic moods

Return ONLY a JSON array of dish recommendations. For each dish, use the actual dish name from above and create a personalized description explaining why it matches the mood.

For each dish, use the image_url from the database. If the image_url starts with "/dishes/", prepend "https://xoworgfijegojldelcjv.supabase.co/storage/v1/object/public" to make it a full URL.
If no image_url exists, use "/placeholder.jpg".

[
  {{
    "id": <number 1-100>,
    "title": "<actual dish name from the list>",
    "description": "<why this specific dish matches their mood in 1-2 sentences>",
    "image": "<full image URL from database or /placeholder.jpg>",
    "price": <actual price from list>,
    "distance": <number between 1-5>,
    "rating": <number between 4.0-5.0>,
    "category": "<actual category from list>"
  }}
]

Important: Return ONLY the JSON array, no other text."""

        # Call OpenAI API
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful food recommendation assistant that returns only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        # Parse OpenAI response
        ai_response = completion.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if ai_response.startswith("```json"):
            ai_response = ai_response[7:]
        if ai_response.startswith("```"):
            ai_response = ai_response[3:]
        if ai_response.endswith("```"):
            ai_response = ai_response[:-3]
        ai_response = ai_response.strip()

        import json
        recommendations = json.loads(ai_response)

        return jsonify({"recommendations": recommendations})

    except json.JSONDecodeError as e:
        return jsonify({"error": "Failed to parse AI response", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def format_restaurants_for_ai(restaurants):
    """Format restaurant data for the AI prompt."""
    formatted = []
    for restaurant in restaurants:
        restaurant_info = f"Restaurant: {restaurant.get('name', 'Unknown')} - {restaurant.get('address', '')}"
        if 'menu_items' in restaurant and restaurant['menu_items']:
            dishes = []
            for item in restaurant['menu_items']:
                name = item.get('name', 'Unknown')
                description = item.get('description', '')
                category = item.get('category', '')
                price = item.get('price', 0)
                image_url = item.get('image_url', '/placeholder.jpg')
                dish = f"- {name} ({category}): {description} (${price}) [image_url: {image_url}]"
                dishes.append(dish)
            restaurant_info += "\n" + "\n".join(dishes)
        formatted.append(restaurant_info)
    return "\n\n".join(formatted)


if __name__ == '__main__':
    app.run(debug=True)
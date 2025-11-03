import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
# Enable CORS for all routes, allowing your frontend to connect
CORS(app)

# Initialize the Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# --- API ROUTES ---

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
        # This is the power of Supabase:
        # We select all columns from 'restaurants' (*)
        # and all associated columns from 'menu_items' (menu_items(*))
        # This works because of the foreign key relationship you defined.
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


# This block allows you to run the app directly with `python app.py`
if __name__ == '__main__':
    app.run(debug=True)
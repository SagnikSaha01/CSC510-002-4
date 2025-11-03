import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# --- Register Routes ---
# Import the blueprint *after* initializing app and supabase
# This avoids a circular import error
from restaurantRoutes import api_blueprint

# Register the blueprint and add a URL prefix
# All routes in api_blueprint will now be prefixed with /api
app.register_blueprint(api_blueprint, url_prefix='/api')

# --- Main Run ---
@app.route("/")
def home():
    """A simple route to test if the server is running."""
    return jsonify({"message": "Welcome to the Vibe Eats API!"})

# This block allows you to run the app directly with `python app.py`
if __name__ == '__main__':
    app.run(debug=True)
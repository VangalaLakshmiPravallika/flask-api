import os
from flask import Flask, jsonify
from dotenv import load_dotenv  # Import dotenv

# ✅ Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# ✅ Use environment variables
PORT = int(os.getenv("PORT", 5000))  # Default to 5000 for local debugging
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/mydb")
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to Fitness API"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)

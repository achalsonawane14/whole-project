from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001"], "supports_credentials": True}})

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        print("Database connection successful")
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection failed: {err}")
        return None

@app.route("/")
def home():
    return "Welcome to the Login API!"

@app.route("/api/login", methods=["OPTIONS", "POST"])
def login():
    if request.method == "OPTIONS":
        response = jsonify({"status": "success"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "OPTIONS,POST")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        response = jsonify({"error": "Username and password are required"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 400

    try:
        conn = get_db_connection()
        if conn is None:
            raise mysql.connector.Error("Failed to connect to the database")

        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE username = %s AND password = %s"
        cursor.execute(query, (username, password))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if result:
            response = jsonify({"success": True, "username": result["username"]})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
        else:
            response = jsonify({"error": "Invalid credentials"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 401

    except mysql.connector.Error as err:
        response = jsonify({"error": "Database connection error"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 500

@app.route("/api/test", methods=["OPTIONS", "GET"])
def test():
    if request.method == "OPTIONS":
        response = jsonify({"status": "success"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "OPTIONS,GET")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    response = jsonify({"message": "CORS test successful"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

if __name__ == "__main__":
    app.run(debug=True, port=8000)

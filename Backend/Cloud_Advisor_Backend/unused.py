from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="achu@22210494@",
            database="user_db"
        )
        print("✅ Database connected successfully!")
        return conn
    except Exception as e:
        print("❌ Database connection failed:", e)
        return None
    
@app.route('/', methods=['GET'])
def home():
    print("on home route")
    return "home page"


@app.route('/api/unused-services', methods=['GET'])

def get_services_with_zero_cost():
    print("🔄 API endpoint hit: /")

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT service, date FROM cost_usage WHERE total_cost = 0.0000000"
        print("📌 Running query:", query)
        cursor.execute(query)
        results = cursor.fetchall()
        print("✅ Query executed, results:", results)

        cursor.close()
        conn.close()
        return jsonify(results)

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    app.run(host="0.0.0.0", port=5002, debug=True)

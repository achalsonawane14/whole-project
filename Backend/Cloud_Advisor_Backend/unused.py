from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import pymysql  # For Azure & GCP connections

app = Flask(__name__)
CORS(app)

# ---------- AWS uses mysql.connector ----------
def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="achu@22210494@",
            database="user_db"
        )
        print("✅ MySQL (AWS) Database connected successfully!")
        return conn
    except mysql.connector.Error as e:
        print("❌ MySQL connection failed:", e)
        return None

# ---------- Azure & GCP use pymysql ----------
def get_pymysql_connection():
    try:
        conn = pymysql.connect(
            host="localhost",
            user="root",
            password="achu@22210494@",
            database="user_db",
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ PyMySQL (Azure/GCP) Database connected successfully!")
        return conn
    except pymysql.MySQLError as e:
        print("❌ PyMySQL connection failed:", e)
        return None

# ---------- Routes ----------

@app.route('/', methods=['GET'])
def home():
    print("🏠 Home route hit")
    return "Welcome to the Cloud Cost API!"

@app.route('/api/aws-unused-services', methods=['GET'])
def get_aws_services_with_zero_cost():
    print("🔄 API endpoint hit: /api/aws-unused-services")

    conn = get_mysql_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT service, date FROM cost_usage WHERE total_cost <0.000001"
        print("📌 Running query:", query)
        cursor.execute(query)
        results = cursor.fetchall()
        print("✅ Query executed, results:", results)
        return jsonify(results)
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/azure-unused-services', methods=['GET'])
def get_azure_services_with_zero_cost():
    print("🔄 API endpoint hit: /api/azure-unused-services")

    conn = get_pymysql_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = """
            SELECT ServiceName, UsageDate 
            FROM azureusage 
            WHERE PreTaxCost <  0.000001 
        """
        print("📌 Running query:", query)
        cursor.execute(query)
        results = cursor.fetchall()
        print("✅ Query executed, results:", results)
        return jsonify(results)
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/gcp-unused-services', methods=['GET'])
def get_gcp_services_with_zero_cost():
    print("🔄 API endpoint hit: /api/gcp-unused-services")

    conn = get_pymysql_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = """
            SELECT service, date 
            FROM gcp_costusage 
            WHERE cost < 50
        """
        print("📌 Running query:", query)
        cursor.execute(query)
        results = cursor.fetchall()
        print("✅ Query executed, results:", results)
        return jsonify({"unused_services": results}), 200
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ---------- Run App ----------
if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    app.run(host="0.0.0.0", port=5002, debug=True)

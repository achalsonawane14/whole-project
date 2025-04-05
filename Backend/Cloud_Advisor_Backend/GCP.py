from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import os
from google.cloud import billing_v1
from google.oauth2 import service_account
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# MySQL database configuration
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# Set up GCP authentication using the path from the .env file
key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(key_path)

# Initialize the Billing API client
client = billing_v1.CloudBillingClient(credentials=credentials)

# Define the billing account ID
billing_account_id = "0118EC-3C50FB-40F16C"

# Fetch cost and usage data from GCP and insert into MySQL
def fetch_and_insert_cost_usage_data():
    request = billing_v1.ListBillingAccountsRequest()
    response = client.list_billing_accounts(request=request)
    
    data = []
    for account in response.billing_accounts:
        data.append({
            'service': 'example-service',
            'service_total': 123.456789,
            'date': datetime.utcnow().strftime('%Y-%m-%d'),
            'cost': 123.456789,
            'total_cost': 123.456789
        })
    
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        for item in data:
            query = """
                INSERT INTO gcp_costUsage (service, service_total, date, cost, total_cost) 
                VALUES (%s, %s, %s, %s, %s) 
                ON DUPLICATE KEY UPDATE 
                cost = VALUES(cost), 
                total_cost = VALUES(total_cost)
            """
            cursor.execute(query, (item['service'], item['service_total'], item['date'], item['cost'], item['total_cost']))
        connection.commit()
    except Exception as e:
        print(f"Error inserting data into MySQL: {e}")
    finally:
        cursor.close()
        connection.close()

# Fetch data from MySQL
def fetch_data_from_mysql():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT date, service, SUM(cost) AS service_cost
            FROM gcp_costUsage
            GROUP BY date, service
            ORDER BY date
        """
        cursor.execute(query)
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        return result
    except Exception as e:
        print(f"Error fetching data from MySQL: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

@app.route('/fetch-cost-usage', methods=['GET'])
def fetch_cost_and_usage():
    try:
        fetch_and_insert_cost_usage_data()
        cost_usage_data = fetch_data_from_mysql()
        return jsonify({"cost_usage_data": cost_usage_data})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/fetch-cost-usage-daily', methods=['GET'])
def fetch_cost_and_usage_daily():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT date, service, SUM(cost) AS service_cost
            FROM gcp_costUsage
            GROUP BY date, service
            ORDER BY date
        """
        cursor.execute(query)
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        return jsonify({"cost_usage_daily": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

@app.route('/fetch-cost-usage-monthly', methods=['GET'])
def fetch_cost_and_usage_monthly():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT DATE_FORMAT(date, '%Y-%m') AS month, service, SUM(cost) AS service_cost
            FROM gcp_costUsage
            GROUP BY month, service
        """
        cursor.execute(query)
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
            row['date'] = row.pop('month')
        return jsonify({"cost_usage_monthly": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

@app.route('/fetch-cost-usage-15days', methods=['GET'])
def fetch_cost_and_usage_15days():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT date, service, SUM(cost) AS service_cost
            FROM gcp_costUsage
            WHERE date >= %s
            GROUP BY date, service
            ORDER BY date
        """
        last_15_days = (datetime.utcnow() - timedelta(days=15)).strftime('%Y-%m-%d')
        cursor.execute(query, (last_15_days,))
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        return jsonify({"cost_usage_15days": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5005)

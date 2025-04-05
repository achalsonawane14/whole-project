from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from datetime import datetime
from azure.identity import ClientSecretCredential
from azure.mgmt.costmanagement import CostManagementClient
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# MySQL database configuration
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "achu@22210494@"
DB_NAME = "user_db"  # Updated database name

# Azure credentials
tenant_id = 'fbb80e19-01a7-4f1f-8319-f8cac7947548'
client_id = '23ad0e53-21e0-4753-984e-e5993b118691'
client_secret = 'oj18Q~wSACO9AtFDn2nI~C~klUbWO3V4ivkJrcTS'
subscription_id = 'e2d4fb8a-81d4-487a-931a-11735b292cfe'

# Convert datetime function
def convert_datetime(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
    except ValueError as e:
        print(f"Error parsing datetime: {e}")
        return None

# Create table if not exists
def create_table():
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS AzureUsage (
            id INT AUTO_INCREMENT PRIMARY KEY,
            UsageDate DATETIME,
            ServiceName VARCHAR(255),
            PreTaxCost DECIMAL(10, 2),
            Currency VARCHAR(10)
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

# Insert Data API Route
@app.route('/insert', methods=['POST'])
def insert_data():
    try:
        # Get JSON from request
        data = request.get_json()
        print(data)  # Log the received data
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        rows = data.get("properties", {}).get("rows", [])
        if not rows:
            return jsonify({"error": "No data found in JSON"}), 400

        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        # Convert datetime values and insert
        insert_query = "INSERT INTO azureusage (UsageDate, ServiceName, PreTaxCost, Currency) VALUES (%s, %s, %s, %s)"
        for row in rows:
            usage_date = convert_datetime(row[0])
            if usage_date:
                cursor.execute(insert_query, (usage_date, row[1], row[2], row[3]))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "✅ Data successfully inserted into MySQL!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
            SELECT UsageDate, ServiceName, SUM(PreTaxCost) AS service_cost
            FROM azureusage
            GROUP BY UsageDate, ServiceName
            ORDER BY UsageDate
        """
        cursor.execute(query)
        result = cursor.fetchall()
        # Convert numeric data to string with 7 digits after decimal
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        
        print(f"Data fetched from MySQL: {result}")
        return result
    except Exception as e:
        print(f"Error fetching data from MySQL: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

# Fetch cost and usage data from Azure Cost Management and insert into MySQL
def fetch_and_insert_cost_usage_data():
    credential = ClientSecretCredential(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret
    )
    cost_management_client = CostManagementClient(credential, subscription_id)
    end_date = datetime.utcnow().date()
    start_date = datetime(2025, 1, 1).date()
    response = cost_management_client.query.usage(
        scope=f"/subscriptions/{subscription_id}",
        parameters={
            "type": "Usage",
            "timeframe": "Custom",
            "timePeriod": {
                "from": start_date.strftime('%Y-%m-%d'),
                "to": end_date.strftime('%Y-%m-%d')
            },
            "dataset": {
                "granularity": "Daily",
                "aggregation": {
                    "totalCost": {
                        "name": "Cost",
                        "function": "Sum"
                    }
                },
                "grouping": [
                    {
                        "type": "Dimension",
                        "name": "ServiceName"
                    }
                ]
            }
        }
    )
    
    print(f"Azure Cost Management Response: {response}")

    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        for item in response["data"]["rows"]:
            date = item["date"]
            service = item["serviceName"]
            cost = float(item["totalCost"])
                
            # Print the service and cost for debugging
            print(f"Inserting Service: {service}, Cost: {cost}")
                
            # Format the values to have 7 digits after the decimal
            cost = float(f"{cost:.7f}")
                
            query = """
                INSERT INTO azureusage (ServiceName, PreTaxCost, UsageDate, Currency) 
                VALUES (%s, %s, %s, %s) 
                ON DUPLICATE KEY UPDATE 
                PreTaxCost = VALUES(PreTaxCost)
            """
            cursor.execute(query, (service, cost, date, 'USD'))
        connection.commit()
    except Exception as e:
        print(f"Error inserting data into MySQL: {e}")
    finally:
        cursor.close()
        connection.close()

# @app.route('/fetch-cost-usage', methods=['GET'])
# def fetch_cost_and_usage():
#     try:
#         cost_usage_data = fetch_data_from_mysql()

#         formatted_data = []
#         for entry in cost_usage_data:
#             formatted_data.append({
#                 'date': entry['UsageDate'].strftime('%Y-%m-%d') if entry['UsageDate'] else 'Invalid Date',
#                 'service': entry['ServiceName'] if entry['ServiceName'] else 'Unknown Service',
#                 'service_cost': float(entry['service_cost']) if entry['service_cost'] else 0.0
#             })

#         logging.debug(f"Final data to be returned: {formatted_data}")
#         return jsonify({"cost_usage_data": formatted_data})
#     except Exception as e:
#         logging.error(f"Error fetching cost usage data: {e}")
#         return jsonify({"error": str(e)})

# This endpoint will fetch data from Azure Cloud and insert it into the database
# Internal use only - not to be called from frontend
@app.route('/getAzureCloudCost', methods=['GET'])
def fetch_and_store_azure_cost_usage():
    try:
        # This function should handle fetching from Azure API and inserting into DB
        fetch_and_insert_azure_cost_usage_data()
        return jsonify({"message": "Azure cost and usage data inserted into DB successfully."})
    except Exception as e:
        return jsonify({"error": str(e)})


# This endpoint will be called from frontend to get cost usage data from MySQL DB
@app.route('/fetch-azure-cost-usage', methods=['GET'])
def get_azure_cost_usage_from_db():
    try:
        cost_usage_data = fetch_azure_data_from_mysql()

        formatted_data = []
        for entry in cost_usage_data:
            formatted_data.append({
                'date': entry['UsageDate'].strftime('%Y-%m-%d') if entry['UsageDate'] else 'Invalid Date',
                'service': entry['ServiceName'] if entry['ServiceName'] else 'Unknown Service',
                'service_cost': float(entry['service_cost']) if entry['service_cost'] else 0.0
            })

        logging.debug(f"Final data to be returned: {formatted_data}")
        return jsonify({"cost_usage_data": formatted_data})
    except Exception as e:
        logging.error(f"Error fetching cost usage data: {e}")
        return jsonify({"error": str(e)})


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
            SELECT UsageDate, ServiceName, SUM(PreTaxCost) AS service_cost
            FROM azureusage
            GROUP BY UsageDate, ServiceName
            HAVING DAY(UsageDate) IN (1, 15, 30, 31)
            ORDER BY UsageDate
        """
        cursor.execute(query)
        result = cursor.fetchall()

        # Convert numeric data to string with 7 digits after decimal
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        
        print(f"15-days interval data fetched from MySQL: {result}")
        return jsonify({"cost_usage_15days": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

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
            SELECT UsageDate, ServiceName, SUM(PreTaxCost) AS service_cost
            FROM azureusage
            GROUP BY UsageDate, ServiceName
            ORDER BY UsageDate
        """
        cursor.execute(query)
        result = cursor.fetchall()

        # Convert numeric data to string with 7 digits after decimal
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        
        print(f"Daily data fetched from MySQL: {result}")
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
            SELECT DATE_FORMAT(UsageDate, '%Y-%m') AS month, ServiceName, SUM(PreTaxCost) AS service_cost
            FROM azureusage
            GROUP BY month, ServiceName
        """
        cursor.execute(query)
        result = cursor.fetchall()

        if not result:
            print("No data fetched from MySQL.")
        else:
            # Convert numeric data to string with 7 digits after decimal
            for row in result:
                row['service_cost'] = f"{float(row['service_cost']):.7f}"

            print(f"Monthly data fetched from MySQL: {result}")
            return jsonify({"cost_usage_monthly": result})

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        connection.close()

        
@app.route("/api/fetch-cost-usage-date-range", methods=["POST"])
def fetch_cost_usage_date_range():
    data = request.get_json()
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not start_date or not end_date:
        return jsonify({"error": "Start date and end date are required"}), 400

    try:
        access_token = get_access_token(tenant_id, client_id, client_secret)
        cost_usage_data = fetch_cost_usage_data(subscription_id, access_token, start_date, end_date)
        return jsonify({"cost_usage_date_range": cost_usage_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        logging.info("Starting Flask server...")
        create_table()  # Ensure table exists
        app.run(debug=True, host='0.0.0.0', port=5001)
    except Exception as e:
        logging.error(f"Failed to start server: {e}")

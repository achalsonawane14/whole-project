from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import boto3
from datetime import datetime
import os
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

# AWS credentials
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
region_name = os.getenv("AWS_REGION")

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
            FROM cost_usage
            GROUP BY date, service
            ORDER BY date
        """
        cursor.execute(query)
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        
        return result
    except Exception as e:
        return []
    finally:
        cursor.close()
        connection.close()

# Fetch cost and usage data from AWS Cost Explorer and insert into MySQL
def fetch_and_insert_cost_usage_data():
    session = boto3.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region_name
    )
    client = session.client('ce')
    end_date = datetime.utcnow().date()
    start_date = datetime(2025, 1, 1).date()
    response = client.get_cost_and_usage(
        TimePeriod={'Start': start_date.strftime('%Y-%m-%d'), 'End': end_date.strftime('%Y-%m-%d')},
        Granularity='DAILY',
        Metrics=['BlendedCost'],
        GroupBy=[{'Type': 'DIMENSION', 'Key': 'SERVICE'}]
    )

    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        for result in response['ResultsByTime']:
            date = result['TimePeriod']['Start']
            for group in result['Groups']:
                service = group['Keys'][0]
                blended_cost = float(f"{float(group['Metrics']['BlendedCost']['Amount']):.7f}")
                
                query = """
                    INSERT INTO cost_usage (service, service_total, date, cost, total_cost) 
                    VALUES (%s, %s, %s, %s, %s) 
                    ON DUPLICATE KEY UPDATE 
                    cost = VALUES(cost), 
                    total_cost = VALUES(total_cost)
                """
                cursor.execute(query, (service, blended_cost, date, blended_cost, blended_cost))
        connection.commit()
    except Exception as e:
        print(f"Error inserting data into MySQL: {e}")
    finally:
        cursor.close()
        connection.close()

# Fetch AWS Cloud Cost and insert into MySQL
# @app.route('/getAWSClooudCost', methods=['GET'])
# def fetch_and_store_cost_usage():
#     try:
#         fetch_and_insert_cost_usage_data()
#         return jsonify({"message": "AWS cost data fetched and stored successfully"})
#     except Exception as e:
#         return jsonify({"error": str(e)})

# Fetch cost usage from MySQL
@app.route('/fetch-cost-usage', methods=['GET'])
def fetch_cost_usage():
    try:
        return jsonify({"cost_usage_data": fetch_data_from_mysql()})
    except Exception as e:
        return jsonify({"error": str(e)})

# Fetch cost usage at 15-day intervals
@app.route('/fetch-cost-usage-15days', methods=['GET'])
def fetch_cost_usage_15days():
    try:
        connection = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT date, service, SUM(cost) AS service_cost
            FROM cost_usage
            GROUP BY date, service
            HAVING DATE_FORMAT(date, '%d') IN ('01', '15', '30', '31')
            ORDER BY date
        """
        cursor.execute(query)
        result = cursor.fetchall()
        for row in result:
            row['service_cost'] = f"{float(row['service_cost']):.7f}"
        
        return jsonify({"cost_usage_15days": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

# Fetch daily cost usage
@app.route('/fetch-cost-usage-daily', methods=['GET'])
def fetch_cost_usage_daily():
    try:
        return jsonify({"cost_usage_daily": fetch_data_from_mysql()})
    except Exception as e:
        return jsonify({"error": str(e)})

# Fetch monthly cost usage
@app.route('/fetch-cost-usage-monthly', methods=['GET'])
def fetch_cost_usage_monthly():
    try:
        connection = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT DATE_FORMAT(date, '%Y-%m') AS month, service, SUM(cost) AS service_cost
            FROM cost_usage
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

# Fetch cost usage in a date range
@app.route('/fetch-cost-usage-date-range', methods=['GET'])
def fetch_cost_usage_date_range():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        connection = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT date, service, SUM(cost) AS service_cost
            FROM cost_usage
            WHERE date BETWEEN %s AND %s
            GROUP BY date, service
        """
        cursor.execute(query, (start_date, end_date))
        result = cursor.fetchall()

        return jsonify({"cost_usage_date_range": result})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

# Fetch unused services
@app.route('/fetch-unused-services', methods=['GET'])
def fetch_unused_services():
    try:
        connection = pymysql.connect(
            host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        query = """
            SELECT service
            FROM cost_usage
            GROUP BY service
            HAVING SUM(service_total) = 0 AND SUM(total_cost) = 0
        """
        cursor.execute(query)
        result = cursor.fetchall()
        unused_services = [row['service'] for row in result]
        
        return jsonify({"unused_services": unused_services})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

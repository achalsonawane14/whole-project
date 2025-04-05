from flask import Flask
from login import app as login_app
from unused import app as unused_app
from aws import app as aws_app
from azure_script import app as azure_app
from GCP import app as gcp_app
import threading

# Initialize Flask app
main_app = Flask(__name__)

# Run multiple services in parallel using threading
def run_app(app, port):
    app.run(port=port, debug=True, use_reloader=False)

if __name__ == "__main__":
    # Start all backend services on different ports
    threading.Thread(target=run_app, args=(login_app, 8000)).start()
    threading.Thread(target=run_app, args=(unused_app, 5002)).start()
    threading.Thread(target=run_app, args=(aws_app, 5000)).start()
    threading.Thread(target=run_app, args=(azure_app, 5001)).start()
    threading.Thread(target=run_app, args=(gcp_app, 5005)).start()

    print("✅ All backend services started!")

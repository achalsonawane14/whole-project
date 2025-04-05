import json
from azure.identity import ClientSecretCredential
import requests


#Shaun cloud acount
#subscription_id ="e2d4fb8a-81d4-487a-931a-11735b292cfe"
#Client ID : 0cee0275-6526-4140-8e2e-603fd7ad065a
#Client _Secret value : Jtj8Q~y5uRQbgb-6tplpcaHAdQFgqN.a66R3tcfD
#Secret id : 11e7de5a-9a22-4e46-b202-53a62cb77152
#Directory ( Tenant ) ID : fbb80e19-01a7-4f1f-8319-f8cac7947548
#Object ID : 546e5244-e642-4751-a722-1ab5c9055a53
#Tenant ID : fbb80e19-01a7-4f1f-8319-f8cac7947548

# Replace these values with your Azure subscription details

tenant_id = 'fbb80e19-01a7-4f1f-8319-f8cac7947548'
client_id = '23ad0e53-21e0-4753-984e-e5993b118691'
client_secret = 'oj18Q~wSACO9AtFDn2nI~C~klUbWO3V4ivkJrcTS'
subscription_id = 'e2d4fb8a-81d4-487a-931a-11735b292cfe'

# Authenticate using the ClientSecretCredential
credential = ClientSecretCredential(tenant_id, client_id, client_secret)

# Get the access token
token = credential.get_token("https://management.azure.com/.default").token

# Set the headers for the request
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Define the URL for the Cost Management API
url = f'https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/query?api-version=2022-10-01'

# Define the query for the Cost Management API
query = {
    "type": "Usage",
    "timeframe": "MonthToDate",
    "dataset": {
        "granularity": "daily",
        "aggregation": {
            "totalCost": {
                "name": "PreTaxCost",
                "function": "Sum"
            }
        }
    }
}

# Make the request to the Cost Management API
response = requests.post(url, headers=headers, json=query)

# Print the response
print(response.json())
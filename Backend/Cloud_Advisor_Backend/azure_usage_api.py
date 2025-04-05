import requests
from azure.identity import ClientSecretCredential

# Set your Azure credentials
tenant_id = '5f3f41de-c923-4df5-9ee1-7d5174995a18'
client_id = '03c7b469-8c1f-4c73-9ffc-1b725754e4ac'
client_secret = '7d2c6c82-35e6-4cab-a7d8-fb93c194d63a'
subscription_id = 'b596c655-361d-4f11-b2bd-ae76286773e3'

def get_access_token(tenant_id, client_id, client_secret):
    """Obtain an access token using client credentials."""
    credential = ClientSecretCredential(tenant_id, client_id, client_secret)
    token = credential.get_token('https://management.azure.com/.default')
    return token.token

def fetch_cost_usage_data(subscription_id, access_token):
    """Fetch cost and usage data from Azure Cost Management API."""
    url = f'https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.CostManagement/usage?api-version=2021-10-01'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'Error: {response.status_code}, {response.text}')

def main():
    try:
        # Get access token
        access_token = get_access_token(tenant_id, client_id, client_secret)
        print("Access token obtained successfully.")
        
        # Fetch cost usage data
        cost_usage_data = fetch_cost_usage_data(subscription_id, access_token)
        print("Cost and usage data fetched successfully:")
        print(cost_usage_data)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()

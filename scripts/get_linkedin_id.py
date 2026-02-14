import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('LINKEDIN_ACCESS_TOKEN')

response = requests.get(
    'https://api.linkedin.com/v2/userinfo',
    headers={'Authorization': f'Bearer {token}'}
)

print(response.json())
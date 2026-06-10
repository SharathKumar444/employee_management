import requests
import json

API_URL = "http://127.0.0.1:8000"

# Test login with correct credentials
payload = {
    "email": "ay@gmail.com",
    "password": "123456"
}

try:
    response = requests.post(
        f"{API_URL}/auth/login",
        json=payload,
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

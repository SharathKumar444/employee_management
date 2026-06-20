import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Test login
email = "ksharathkumar@gmail.com"
password = "123456"

print("Testing login endpoint...")
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": email, "password": password}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    data = response.json()
    if "suspension_status" in data:
        print("\n✓ SUCCESS: suspension_status field is present in response!")
        print(f"  - suspension_status: {data.get('suspension_status')}")
        print(f"  - suspended_by: {data.get('suspended_by')}")
        print(f"  - suspended_at: {data.get('suspended_at')}")
        print(f"  - suspension_reason: {data.get('suspension_reason')}")
    else:
        print("\n✗ FAILED: suspension_status field is NOT present in response!")
else:
    print(f"\n✗ FAILED: Login returned status {response.status_code}")

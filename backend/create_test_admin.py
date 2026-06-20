import sqlite3
from datetime import datetime

conn = sqlite3.connect('employee.db')
cursor = conn.cursor()

# Create a test admin user
test_admin = {
    'name': 'Test Admin',
    'email': 'testadmin@gmail.com',
    'password': '123456',  # In real app this would be hashed, but for testing it's OK
    'role': 'admin',
    'company_id': 'COMP001',
    'is_active': True,
    'attendance_access': True,
}

# Check if user already exists
cursor.execute("SELECT id FROM users WHERE email = ?", (test_admin['email'],))
existing = cursor.fetchone()

if existing:
    # Update to be active
    cursor.execute("""
        UPDATE users 
        SET is_active = 1, deactivated_by = NULL, deactivated_at = NULL
        WHERE email = ?
    """, (test_admin['email'],))
    print(f"Updated existing user {test_admin['email']} to active")
else:
    # Insert new admin
    cursor.execute("""
        INSERT INTO users (name, email, password, role, company_id, is_active, attendance_access)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        test_admin['name'],
        test_admin['email'],
        test_admin['password'],
        test_admin['role'],
        test_admin['company_id'],
        test_admin['is_active'],
        test_admin['attendance_access']
    ))
    print(f"Created new test admin user: {test_admin['email']}")

conn.commit()
conn.close()

print("✓ Test admin user ready for testing")
print(f"  Email: {test_admin['email']}")
print(f"  Password: {test_admin['password']}")

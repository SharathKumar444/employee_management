import sqlite3
import os

db_path = os.path.join(os.getcwd(), '..', 'employee.db')
if not os.path.exists(db_path):
    db_path = os.path.join(os.getcwd(), 'employee.db')

print(f"Database path: {db_path}")
print(f"Database exists: {os.path.exists(db_path)}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all users
cursor.execute("SELECT id, name, email, password, role, company_id, is_active FROM users")
users = cursor.fetchall()

print("\n=== ALL USERS IN DATABASE ===")
for user in users:
    print(f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Password: {user[3]}, Role: {user[4]}, Company: {user[5]}, Active: {user[6]}")

conn.close()
print("\n=== END ===")

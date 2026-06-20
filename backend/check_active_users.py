import sqlite3

conn = sqlite3.connect('employee.db')
cursor = conn.cursor()

# Get all users
cursor.execute("SELECT id, name, email, role, is_active, company_id FROM users LIMIT 10")
users = cursor.fetchall()

print("Active Users:")
print("=" * 100)
for user in users:
    print(f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Role: {user[3]}, Active: {user[4]}, Company: {user[5]}")

# Get active admins specifically
cursor.execute("SELECT id, name, email, role, is_active, company_id FROM users WHERE is_active = 1 AND role = 'admin'")
active_admins = cursor.fetchall()

print("\n\nActive Admin Users:")
print("=" * 100)
for admin in active_admins:
    print(f"ID: {admin[0]}, Name: {admin[1]}, Email: {admin[2]}, Role: {admin[3]}, Active: {admin[4]}, Company: {admin[5]}")

conn.close()

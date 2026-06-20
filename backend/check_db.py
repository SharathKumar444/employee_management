import sqlite3

conn = sqlite3.connect('employee.db')
cursor = conn.cursor()

# Check users table schema
cursor.execute("PRAGMA table_info(users)")
print("Users table columns:")
for row in cursor.fetchall():
    print(row)

# Check reinstatement_requests table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reinstatement_requests'")
if cursor.fetchone():
    print("\nReinstatement requests table EXISTS")
else:
    print("\nReinstatement requests table DOES NOT EXIST")

conn.close()

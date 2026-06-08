import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check current columns in customers
cursor.execute("PRAGMA table_info(customers)")
columns = [col[1] for col in cursor.fetchall()]

# Add phone column if not present
if 'phone' not in columns:
    print("Adding 'phone' column to 'customers' table...")
    cursor.execute("ALTER TABLE customers ADD COLUMN phone VARCHAR(50)")
else:
    print("'phone' column already exists in 'customers' table.")

# Add address column if not present
if 'address' not in columns:
    print("Adding 'address' column to 'customers' table...")
    cursor.execute("ALTER TABLE customers ADD COLUMN address TEXT")
else:
    print("'address' column already exists in 'customers' table.")

conn.commit()
conn.close()
print("Migration completed successfully.")

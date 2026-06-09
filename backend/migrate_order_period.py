import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE orders ADD COLUMN delivery_period VARCHAR(50) DEFAULT '30'")
    conn.commit()
    print("Column 'delivery_period' added successfully to 'orders' table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'delivery_period' already exists in 'orders' table.")
    else:
        print(f"Error adding 'delivery_period' to 'orders' table: {e}")

conn.close()
print("Migration completed.")

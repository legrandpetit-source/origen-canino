import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Add delivery_period to pets table
try:
    cursor.execute("ALTER TABLE pets ADD COLUMN delivery_period INTEGER DEFAULT 30")
    conn.commit()
    print("Column 'delivery_period' added successfully to 'pets' table.")
except sqlite3.OperationalError as e:
    # Under sqlite, if column already exists, ALTER TABLE fails with operational error
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'delivery_period' already exists in 'pets' table.")
    else:
        print(f"Error adding 'delivery_period' to 'pets' table: {e}")

# 2. Add shipping_cost to parameters table
try:
    cursor.execute("ALTER TABLE parameters ADD COLUMN shipping_cost INTEGER DEFAULT 5000")
    conn.commit()
    print("Column 'shipping_cost' added successfully to 'parameters' table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'shipping_cost' already exists in 'parameters' table.")
    else:
        print(f"Error adding 'shipping_cost' to 'parameters' table: {e}")

conn.close()
print("Migration completed.")

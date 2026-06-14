import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add kilos_needed to pets table
try:
    cursor.execute("ALTER TABLE pets ADD COLUMN kilos_needed REAL")
    conn.commit()
    print("Column 'kilos_needed' added successfully to 'pets' table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'kilos_needed' already exists in 'pets' table.")
    else:
        print(f"Error adding 'kilos_needed' to 'pets' table: {e}")

conn.close()
print("Migration completed.")

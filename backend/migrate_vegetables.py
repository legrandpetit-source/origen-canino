import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE pets ADD COLUMN added_vegetables_fruits TEXT")
    conn.commit()
    print("Column 'added_vegetables_fruits' added successfully to 'pets' table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'added_vegetables_fruits' already exists in 'pets' table.")
    else:
        print(f"Error adding 'added_vegetables_fruits' to 'pets' table: {e}")

conn.close()
print("Migration completed.")

import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS additionals (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            icon VARCHAR(20) NOT NULL,
            price INTEGER DEFAULT 1500
        )
    """)
    conn.commit()
    print("Table 'additionals' created successfully or already exists.")
except sqlite3.OperationalError as e:
    print(f"Error creating 'additionals' table: {e}")

conn.close()
print("Migration completed.")

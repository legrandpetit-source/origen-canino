import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Add columns to additionals table
for col_name, col_type in [("vitamins", "VARCHAR(255)"), ("benefits", "TEXT")]:
    try:
        cursor.execute(f"ALTER TABLE additionals ADD COLUMN {col_name} {col_type}")
        print(f"Column '{col_name}' added to 'additionals' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print(f"Column '{col_name}' already exists in 'additionals' table.")
        else:
            print(f"Error adding column '{col_name}': {e}")

# 2. Create ingredients_info table
try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ingredients_info (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            vitamins VARCHAR(255),
            benefits TEXT
        )
    """)
    print("Table 'ingredients_info' created successfully or already exists.")
except sqlite3.OperationalError as e:
    print(f"Error creating 'ingredients_info' table: {e}")

conn.commit()
conn.close()
print("Migration completed.")

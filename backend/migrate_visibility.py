import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Add visible column to recipes table
try:
    cursor.execute("ALTER TABLE recipes ADD COLUMN visible BOOLEAN DEFAULT 1")
    print("Column 'visible' added to 'recipes' table.")
    cursor.execute("UPDATE recipes SET visible = 1")
    print("Existing recipes set to visible = 1.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'visible' already exists in 'recipes' table.")
    else:
        print(f"Error adding column 'visible' to 'recipes': {e}")

# 2. Add visible column to snacks table
try:
    cursor.execute("ALTER TABLE snacks ADD COLUMN visible BOOLEAN DEFAULT 1")
    print("Column 'visible' added to 'snacks' table.")
    cursor.execute("UPDATE snacks SET visible = 1")
    print("Existing snacks set to visible = 1.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'visible' already exists in 'snacks' table.")
    else:
        print(f"Error adding column 'visible' to 'snacks': {e}")

# 3. Add visible column to additionals table
try:
    cursor.execute("ALTER TABLE additionals ADD COLUMN visible BOOLEAN DEFAULT 1")
    print("Column 'visible' added to 'additionals' table.")
    cursor.execute("UPDATE additionals SET visible = 1")
    print("Existing additionals set to visible = 1.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'visible' already exists in 'additionals' table.")
    else:
        print(f"Error adding column 'visible' to 'additionals': {e}")

conn.commit()
conn.close()
print("Migration completed.")

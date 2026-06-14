import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'origen_canino.db')
print(f"Connecting to database at: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add active column to testimonials table
try:
    cursor.execute("ALTER TABLE testimonials ADD COLUMN active BOOLEAN DEFAULT 0")
    print("Column 'active' added to 'testimonials' table.")
    
    # Update all existing testimonials to active = 1 (True) so they remain visible
    cursor.execute("UPDATE testimonials SET active = 1")
    print("Existing testimonials set to active = 1.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
        print("Column 'active' already exists in 'testimonials' table.")
    else:
        print(f"Error adding column 'active': {e}")

conn.commit()
conn.close()
print("Migration completed.")

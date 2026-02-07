from app import app
from utils.database import db
from sqlalchemy import text

with app.app_context():
    try:
        with db.engine.connect() as connection:
            connection.execute(text("ALTER TABLE usuario ADD COLUMN turno_id INTEGER REFERENCES turno(id)"))
            connection.commit()
        print("Migration successful: Added turno_id to usuario table")
    except Exception as e:
        print(f"Migration failed (maybe column already exists): {e}")

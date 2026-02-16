"""
Vercel serverless entry point.
Wraps the Flask app so Vercel can serve it as a serverless function.
"""
import sys
import os

# Ensure the backend root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db

app = create_app()

# Auto-create tables on cold start (no alembic on serverless)
try:
    with app.app_context():
        db.create_all()
except Exception as e:
    print(f"[Vercel] Warning: db.create_all() failed: {e}")

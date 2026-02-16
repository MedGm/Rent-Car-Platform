"""
Vercel serverless entry point.
Wraps the Flask app so Vercel can serve it as a serverless function.
"""
import sys
import os
import traceback

# Ensure the backend root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app import create_app, db
    app = create_app()

    # Auto-create tables on cold start (no alembic on serverless)
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        print(f"[Vercel] Warning: db.create_all() failed: {e}")

except Exception as e:
    # If the app fails to import/create, serve a diagnostic Flask app
    from flask import Flask, jsonify
    app = Flask(__name__)
    error_msg = traceback.format_exc()
    print(f"[Vercel] FATAL: App failed to start:\n{error_msg}")

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return jsonify({
            'error': 'App failed to start',
            'details': str(e),
            'traceback': error_msg,
        }), 500

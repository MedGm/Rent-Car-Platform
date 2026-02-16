import os
import re


def _get_database_url():
    """Get database URL, fixing common issues."""
    url = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'

    # Strip accidental psql command wrapper: psql 'postgresql://...'
    if url.startswith("psql "):
        url = url.removeprefix("psql ").strip().strip("'\"")

    # Neon / Heroku use postgres:// but SQLAlchemy requires postgresql://
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)

    # Remove channel_binding param (psycopg2 doesn't support it)
    url = re.sub(r'[&?]channel_binding=[^&]*', '', url)
    # Fix broken query string if channel_binding was the first param
    url = url.replace('?&', '?')

    return url


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = _get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SSL required for Neon / cloud Postgres
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }
    # Use /tmp on serverless (Vercel) since filesystem is read-only
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or os.path.join(os.getcwd(), 'app/static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max limit

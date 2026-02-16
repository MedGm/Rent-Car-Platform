import os
import tempfile

class TestConfig:
    """Configuration for unit tests — uses a separate test database on PostgreSQL."""
    TESTING = True
    SECRET_KEY = 'test-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'postgresql://admin:password@db:5432/car_rental_test_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = tempfile.mkdtemp()
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    SERVER_NAME = 'localhost'

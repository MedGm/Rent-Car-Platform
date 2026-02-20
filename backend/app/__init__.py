from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    # CORS: allow configured origins
    allowed_origins = ["http://localhost:3000"]
    frontend_url = os.environ.get("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)
        # Also allow www variant and http variant
        if frontend_url.startswith("https://"):
            allowed_origins.append(frontend_url.replace("https://", "http://"))
        domain = frontend_url.split("://", 1)[1]
        if not domain.startswith("www."):
            allowed_origins.append(f"{frontend_url.split('://')[0]}://www.{domain}")
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    from app import models
    from app.auth import auth_bp
    from app.routes.cars import cars_bp
    from app.routes.bookings import bookings_bp
    from app.routes.contracts import contracts_bp
    from app.routes.articles import articles_bp
    from app.routes.services import services_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cars_bp, url_prefix='/api/cars')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(contracts_bp, url_prefix='/api/contracts')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(services_bp, url_prefix='/api/services')

    # Health check endpoint
    @app.route('/api/health')
    def health():
        try:
            db.session.execute(db.text('SELECT 1'))
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'
        return {
            'status': 'ok',
            'database': db_status,
            'db_uri_prefix': app.config['SQLALCHEMY_DATABASE_URI'][:30] + '...',
        }

    # Serve static files (uploads) in development
    from flask import send_from_directory

    @app.route('/static/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

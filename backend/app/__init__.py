from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app import models
    from app.auth import auth_bp
    from app.routes.cars import cars_bp
    from app.routes.bookings import bookings_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cars_bp, url_prefix='/api/cars')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')

    return app

from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False)
    phone = db.Column(db.String(20))
    driver_license_info = db.Column(db.Text)

    bookings = db.relationship('Booking', backref='user', lazy='dynamic')

class Car(db.Model):
    __tablename__ = 'cars'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    specs = db.Column(JSONB)  # Requires PostgreSQL
    images = db.Column(JSONB) # List of image URLs
    brand_logo = db.Column(db.String(500))  # Brand logo image URL
    is_active = db.Column(db.Boolean, default=True)
    price_per_day = db.Column(db.Integer, default=0)

    bookings = db.relationship('Booking', backref='car', lazy='dynamic')
    calendar_blocks = db.relationship('CalendarBlock', backref='car', lazy='dynamic')

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    car_id = db.Column(db.Integer, db.ForeignKey('cars.id'))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, confirmed, modified, cancelled
    total_price = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Customer details for guest bookings / contracts
    customer_name = db.Column(db.String(100), nullable=True)
    customer_email = db.Column(db.String(120), nullable=True)
    customer_phone = db.Column(db.String(20), nullable=True)
    customer_details = db.Column(JSONB, nullable=True)  # Extra contract fields

    contract = db.relationship('Contract', backref='booking', uselist=False)

    __table_args__ = (
        db.Index('ix_booking_dates', 'car_id', 'start_date', 'end_date'),
    )

class CalendarBlock(db.Model):
    __tablename__ = 'calendar_blocks'
    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey('cars.id'))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(50)) # booking, maintenance

class Contract(db.Model):
    __tablename__ = 'contracts'
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    pdf_path = db.Column(db.String(255))
    invoice_data = db.Column(JSONB)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Article(db.Model):
    __tablename__ = 'articles'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    excerpt = db.Column(db.String(500))
    content = db.Column(db.Text)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50), default='Shield')  # lucide icon name
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

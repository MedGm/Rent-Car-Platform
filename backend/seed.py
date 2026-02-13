from app import create_app, db
from app.models import User, Car
from werkzeug.security import generate_password_hash
import json

app = create_app()

def seed_data():
    with app.app_context():
        # Create Admin User
        if not User.query.filter_by(email='admin@rent.com').first():
            print("Creating admin user...")
            admin = User(
                username='admin',
                email='admin@rent.com',
                password_hash=generate_password_hash('admin123'),
                is_admin=True,
                phone='+1234567890'
            )
            db.session.add(admin)
        
        # Create Sample Cars
        if Car.query.count() == 0:
            print("Creating sample cars...")
            cars = [
                {
                    "name": "Tesla Model 3",
                    "category": "Sedan",
                    "specs": {"seats": 5, "fuel": "Electric", "transmission": "Automatic"},
                    "images": ["https://images.unsplash.com/photo-1536700503339-1e4b065207d3?auto=format&fit=crop&w=800&q=80"],
                    "is_active": True
                },
                {
                    "name": "BMW X5",
                    "category": "SUV",
                    "specs": {"seats": 7, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": ["https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=800&q=80"],
                    "is_active": True
                },
                {
                    "name": "Mercedes C-Class",
                    "category": "Sedan",
                    "specs": {"seats": 5, "fuel": "Petrol", "transmission": "Automatic"},
                    "images": ["https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"],
                    "is_active": True
                }
            ]
            
            for car_data in cars:
                car = Car(
                    name=car_data['name'],
                    category=car_data['category'],
                    specs=car_data['specs'],
                    images=car_data['images'],
                    is_active=car_data['is_active']
                )
                db.session.add(car)
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()

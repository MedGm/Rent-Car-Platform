from app import create_app, db
from app.models import User, Car, Article, Service
from werkzeug.security import generate_password_hash

app = create_app()

def seed_dev_data():
    with app.app_context():
        # Clear existing data to avoid duplicates on multiple runs
        print("Clearing database...")
        db.drop_all()
        db.create_all()

        print("Seeding admin user...")
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True,
            phone='+212600000000'
        )
        db.session.add(admin)

        print("Seeding cars...")
        cars = [
            Car(
                name="Range Rover Sport",
                category="Luxury SUV",
                price_per_day=2500,
                brand_logo="https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Land_Rover_logo.svg/800px-Land_Rover_logo.svg.png",
                images=[
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a046d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
                    "https://images.unsplash.com/photo-1606664515524-ed2f786a046d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
                ],
                specs={
                    "seats": 5,
                    "fuel": "Diesel",
                    "transmission": "Automatic",
                    "engine": "3.0L V6",
                    "horsepower": "300 hp"
                }
            ),
            Car(
                name="Mercedes-Benz G-Class",
                category="Luxury SUV",
                price_per_day=3000,
                brand_logo="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/800px-Mercedes-Logo.svg.png",
                images=[
                    "https://images.unsplash.com/photo-1520031441872-265e4ff70366?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
                    "https://images.unsplash.com/photo-1520031441872-265e4ff70366?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
                ],
                specs={
                    "seats": 5,
                    "fuel": "Petrol",
                    "transmission": "Automatic",
                    "engine": "4.0L V8",
                    "horsepower": "416 hp"
                }
            ),
            Car(
                name="Porsche 911 Carrera",
                category="Sports",
                price_per_day=3500,
                brand_logo="https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Porsche_logo.svg/800px-Porsche_logo.svg.png",
                images=[
                    "https://images.unsplash.com/photo-1503376721528-766b4d36ef55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
                    "https://images.unsplash.com/photo-1503376721528-766b4d36ef55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
                ],
                specs={
                    "seats": 2,
                    "fuel": "Petrol",
                    "transmission": "Automatic",
                    "engine": "3.0L Flat-6",
                    "horsepower": "379 hp"
                }
            )
        ]
        db.session.add_all(cars)

        print("Seeding services...")
        services = [
            Service(title="Chauffeur Service", description="Premium chauffeur service for your comfort.", icon="User", sort_order=1),
            Service(title="Airport Transfer", description="Reliable airport pick-ups and drop-offs.", icon="Plane", sort_order=2),
            Service(title="Wedding Cars", description="Make your special day elegant with our luxury cars.", icon="Heart", sort_order=3)
        ]
        db.session.add_all(services)

        print("Seeding articles...")
        articles = [
            Article(
                title="Top 5 Scenic Drives in Morocco",
                excerpt="Discover the most beautiful roads to experience with a luxury rental.",
                content="<p>Full article content goes here...</p>",
                category="Travel",
                image_url="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
            )
        ]
        db.session.add_all(articles)

        db.session.commit()
        print("✅ Development database seeded successfully!")

if __name__ == '__main__':
    seed_dev_data()

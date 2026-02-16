"""
Comprehensive API unit tests for the Car Rental Platform.
Covers: Auth, Cars, Bookings, Articles, Services, Contracts endpoints.
"""
import json
import pytest
import jwt
import os
import tempfile
from datetime import datetime, timedelta, date
from werkzeug.security import generate_password_hash

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

from app import create_app, db as _db
from app.models import User, Car, Booking, CalendarBlock, Contract, Article, Service
from tests.conftest import TestConfig


@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    app = create_app(TestConfig)
    yield app


@pytest.fixture(autouse=True)
def _setup_db(app):
    """Create tables before each test and drop them after."""
    with app.app_context():
        _db.create_all()
    yield
    with app.app_context():
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_user(app):
    """Insert an admin user and return it."""
    with app.app_context():
        user = User(
            username='admin',
            email='admin@test.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True,
        )
        _db.session.add(user)
        _db.session.commit()
        user_id = user.id
    return {'id': user_id, 'email': 'admin@test.com', 'password': 'admin123'}


@pytest.fixture
def non_admin_user(app):
    """Insert a regular (non-admin) user."""
    with app.app_context():
        user = User(
            username='regular',
            email='regular@test.com',
            password_hash=generate_password_hash('pass123'),
            is_admin=False,
        )
        _db.session.add(user)
        _db.session.commit()
        user_id = user.id
    return {'id': user_id, 'email': 'regular@test.com', 'password': 'pass123'}


@pytest.fixture
def admin_token(app, admin_user):
    """Return a valid JWT for the admin user."""
    token = jwt.encode(
        {'user_id': admin_user['id'], 'exp': datetime.utcnow() + timedelta(hours=24)},
        TestConfig.SECRET_KEY,
        algorithm='HS256',
    )
    return token


@pytest.fixture
def auth_headers(admin_token):
    """Return headers dict with Bearer token."""
    return {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}


@pytest.fixture
def sample_car(app):
    """Insert a sample car."""
    with app.app_context():
        car = Car(
            name='Test Dacia Logan',
            category='Sedan',
            specs={'seats': 5, 'fuel': 'Diesel', 'transmission': 'Manual'},
            images=['https://example.com/car1.jpg'],
            brand_logo='https://example.com/dacia.png',
            is_active=True,
            price_per_day=300,
        )
        _db.session.add(car)
        _db.session.commit()
        car_id = car.id
    return car_id


@pytest.fixture
def sample_booking(app, sample_car):
    """Insert a sample confirmed booking."""
    with app.app_context():
        today = date.today()
        booking = Booking(
            car_id=sample_car,
            start_date=today + timedelta(days=30),
            end_date=today + timedelta(days=35),
            status='confirmed',
            total_price=1500.0,
            customer_name='Test Customer',
            customer_email='customer@test.com',
            customer_phone='+212600000000',
            customer_details={'cin': 'AB 123456'},
        )
        _db.session.add(booking)
        _db.session.commit()
        booking_id = booking.id
    return booking_id


# ═══════════════════════════════════════════════════════════════════════════
#  AUTH TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestAuth:

    def test_login_success(self, client, admin_user):
        resp = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': admin_user['password'],
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'token' in data
        assert data['user']['email'] == admin_user['email']

    def test_login_missing_fields(self, client):
        resp = client.post('/api/auth/login', json={})
        assert resp.status_code == 400

    def test_login_wrong_password(self, client, admin_user):
        resp = client.post('/api/auth/login', json={
            'email': admin_user['email'],
            'password': 'wrongpassword',
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@test.com',
            'password': '123',
        })
        assert resp.status_code == 401

    def test_login_non_admin_rejected(self, client, non_admin_user):
        resp = client.post('/api/auth/login', json={
            'email': non_admin_user['email'],
            'password': non_admin_user['password'],
        })
        assert resp.status_code == 403

    def test_admin_endpoint_no_token(self, client, sample_car):
        resp = client.get('/api/bookings')
        assert resp.status_code == 401

    def test_admin_endpoint_invalid_token(self, client, sample_car):
        resp = client.get('/api/bookings', headers={
            'Authorization': 'Bearer invalidtoken123',
        })
        assert resp.status_code == 401

    def test_admin_endpoint_expired_token(self, client, app, admin_user):
        token = jwt.encode(
            {'user_id': admin_user['id'], 'exp': datetime.utcnow() - timedelta(hours=1)},
            TestConfig.SECRET_KEY,
            algorithm='HS256',
        )
        resp = client.get('/api/bookings', headers={
            'Authorization': f'Bearer {token}',
        })
        assert resp.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════
#  CARS TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestCars:

    def test_get_cars_public(self, client, sample_car):
        """Public endpoint should list active cars."""
        resp = client.get('/api/cars')
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1
        assert data[0]['name'] == 'Test Dacia Logan'
        assert data[0]['price_per_day'] == 300

    def test_get_cars_excludes_inactive(self, client, app):
        """Inactive cars should not appear in public list."""
        with app.app_context():
            car = Car(name='Hidden Car', category='SUV', is_active=False, price_per_day=100)
            _db.session.add(car)
            _db.session.commit()
        resp = client.get('/api/cars')
        data = resp.get_json()
        names = [c['name'] for c in data]
        assert 'Hidden Car' not in names

    def test_get_single_car(self, client, sample_car):
        resp = client.get(f'/api/cars/{sample_car}')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['id'] == sample_car
        assert data['price_per_day'] == 300

    def test_get_car_not_found(self, client):
        resp = client.get('/api/cars/99999')
        assert resp.status_code == 404

    def test_create_car_requires_admin(self, client):
        resp = client.post('/api/cars', data={'name': 'NewCar'})
        assert resp.status_code == 401

    def test_create_car(self, client, auth_headers, admin_user):
        """Admin can create a car via form-data."""
        resp = client.post('/api/cars', data={
            'name': 'BMW X3',
            'category': 'SUV',
            'specs': json.dumps({'seats': 5, 'fuel': 'Diesel'}),
            'is_active': 'true',
            'price_per_day': '800',
        }, headers={'Authorization': auth_headers['Authorization']})
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['id'] is not None

    def test_update_car_json(self, client, auth_headers, sample_car):
        """Admin can update car with JSON body."""
        resp = client.put(f'/api/cars/{sample_car}', json={
            'name': 'Updated Name',
            'price_per_day': 999,
        }, headers=auth_headers)
        assert resp.status_code == 200
        # Verify
        resp2 = client.get(f'/api/cars/{sample_car}')
        assert resp2.get_json()['name'] == 'Updated Name'
        assert resp2.get_json()['price_per_day'] == 999

    def test_delete_car_soft(self, client, auth_headers, sample_car):
        """DELETE should soft-delete (deactivate) the car."""
        resp = client.delete(f'/api/cars/{sample_car}', headers=auth_headers)
        assert resp.status_code == 200
        # Car should no longer appear in public list
        resp2 = client.get('/api/cars')
        ids = [c['id'] for c in resp2.get_json()]
        assert sample_car not in ids


# ═══════════════════════════════════════════════════════════════════════════
#  BOOKINGS TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestBookings:

    def test_create_booking(self, client, sample_car):
        """Public users can create a pending booking."""
        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': sample_car,
            'start_date': (today + timedelta(days=60)).isoformat(),
            'end_date': (today + timedelta(days=65)).isoformat(),
            'driver_name': 'John Doe',
            'email': 'john@example.com',
            'phone': '+1234567890',
            'nationality': 'US',
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['id'] is not None
        assert data['total_price'] == 300 * 5  # 5 days × 300 MAD

    def test_create_booking_invalid_dates(self, client, sample_car):
        """End date before start date should fail."""
        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': sample_car,
            'start_date': (today + timedelta(days=10)).isoformat(),
            'end_date': (today + timedelta(days=5)).isoformat(),
        })
        assert resp.status_code == 400

    def test_create_booking_same_dates(self, client, sample_car):
        """Start date == end date should fail."""
        d = (date.today() + timedelta(days=70)).isoformat()
        resp = client.post('/api/bookings', json={
            'car_id': sample_car,
            'start_date': d,
            'end_date': d,
        })
        assert resp.status_code == 400

    def test_create_booking_car_not_found(self, client):
        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': 99999,
            'start_date': (today + timedelta(days=60)).isoformat(),
            'end_date': (today + timedelta(days=65)).isoformat(),
        })
        assert resp.status_code == 404

    def test_create_booking_overlap_rejected(self, client, sample_booking, sample_car):
        """Booking that overlaps a confirmed booking should be rejected."""
        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': sample_car,
            'start_date': (today + timedelta(days=32)).isoformat(),
            'end_date': (today + timedelta(days=37)).isoformat(),
        })
        assert resp.status_code == 409

    def test_create_booking_maintenance_block(self, client, app, sample_car):
        """Booking overlapping a maintenance block should be rejected."""
        today = date.today()
        with app.app_context():
            block = CalendarBlock(
                car_id=sample_car,
                start_date=today + timedelta(days=80),
                end_date=today + timedelta(days=85),
                reason='maintenance',
            )
            _db.session.add(block)
            _db.session.commit()
        resp = client.post('/api/bookings', json={
            'car_id': sample_car,
            'start_date': (today + timedelta(days=82)).isoformat(),
            'end_date': (today + timedelta(days=84)).isoformat(),
        })
        assert resp.status_code == 409

    def test_get_bookings_requires_admin(self, client):
        resp = client.get('/api/bookings')
        assert resp.status_code == 401

    def test_get_bookings(self, client, auth_headers, sample_booking):
        resp = client.get('/api/bookings', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1
        assert data[0]['total_price'] is not None

    def test_update_booking_status_confirm(self, client, app, auth_headers, sample_car):
        """Admin can confirm a pending booking."""
        today = date.today()
        with app.app_context():
            b = Booking(
                car_id=sample_car,
                start_date=today + timedelta(days=90),
                end_date=today + timedelta(days=95),
                status='pending',
                customer_name='Pending User',
            )
            _db.session.add(b)
            _db.session.commit()
            bid = b.id
        resp = client.patch(f'/api/bookings/{bid}/status', json={'status': 'confirmed'}, headers=auth_headers)
        assert resp.status_code == 200

    def test_update_booking_status_cancel(self, client, auth_headers, sample_booking):
        resp = client.patch(f'/api/bookings/{sample_booking}/status', json={'status': 'cancelled'}, headers=auth_headers)
        assert resp.status_code == 200

    def test_update_booking_invalid_status(self, client, auth_headers, sample_booking):
        resp = client.patch(f'/api/bookings/{sample_booking}/status', json={'status': 'invalid'}, headers=auth_headers)
        assert resp.status_code == 400

    def test_confirm_overlapping_booking_rejected(self, client, app, auth_headers, sample_car, sample_booking):
        """Confirming a booking that overlaps another confirmed one should fail."""
        today = date.today()
        with app.app_context():
            b2 = Booking(
                car_id=sample_car,
                start_date=today + timedelta(days=31),
                end_date=today + timedelta(days=36),
                status='pending',
                customer_name='Overlap User',
            )
            _db.session.add(b2)
            _db.session.commit()
            bid2 = b2.id
        resp = client.patch(f'/api/bookings/{bid2}/status', json={'status': 'confirmed'}, headers=auth_headers)
        assert resp.status_code == 409

    def test_get_availability(self, client, sample_car, sample_booking):
        resp = client.get(f'/api/bookings/availability/{sample_car}')
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1
        assert data[0]['type'] == 'booking'


# ═══════════════════════════════════════════════════════════════════════════
#  ARTICLES TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestArticles:

    def _create_article(self, app, published=True):
        with app.app_context():
            a = Article(
                title='Test Article',
                excerpt='Short excerpt',
                content='Full content here',
                category='Travel',
                is_published=published,
            )
            _db.session.add(a)
            _db.session.commit()
            return a.id

    def test_get_published_articles(self, client, app):
        aid = self._create_article(app, published=True)
        resp = client.get('/api/articles')
        assert resp.status_code == 200
        data = resp.get_json()
        assert any(a['id'] == aid for a in data)

    def test_unpublished_hidden_from_public(self, client, app):
        aid = self._create_article(app, published=False)
        resp = client.get('/api/articles')
        data = resp.get_json()
        assert not any(a['id'] == aid for a in data)

    def test_get_single_article(self, client, app):
        aid = self._create_article(app)
        resp = client.get(f'/api/articles/{aid}')
        assert resp.status_code == 200
        assert resp.get_json()['title'] == 'Test Article'

    def test_get_single_unpublished_article_404(self, client, app):
        aid = self._create_article(app, published=False)
        resp = client.get(f'/api/articles/{aid}')
        assert resp.status_code == 404

    def test_get_all_articles_admin(self, client, app, auth_headers):
        self._create_article(app, published=False)
        resp = client.get('/api/articles/all', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1

    def test_create_article_json(self, client, auth_headers):
        resp = client.post('/api/articles', json={
            'title': 'New Article',
            'excerpt': 'Excerpt',
            'content': 'Body text',
            'category': 'News',
        }, headers=auth_headers)
        assert resp.status_code == 201

    def test_create_article_no_title(self, client, auth_headers):
        resp = client.post('/api/articles', json={
            'content': 'Body only',
        }, headers=auth_headers)
        assert resp.status_code == 400

    def test_update_article(self, client, app, auth_headers):
        aid = self._create_article(app)
        resp = client.put(f'/api/articles/{aid}', json={
            'title': 'Updated Title',
            'is_published': False,
        }, headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_article(self, client, app, auth_headers):
        aid = self._create_article(app)
        resp = client.delete(f'/api/articles/{aid}', headers=auth_headers)
        assert resp.status_code == 200
        # Verify deleted
        resp2 = client.get(f'/api/articles/{aid}')
        assert resp2.status_code == 404

    def test_create_article_requires_admin(self, client):
        resp = client.post('/api/articles', json={'title': 'Nope'})
        assert resp.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════
#  SERVICES TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestServices:

    def _create_service(self, app, active=True):
        with app.app_context():
            s = Service(
                title='Airport Transfer',
                description='Pick-up from Agadir airport',
                icon='Plane',
                is_active=active,
                sort_order=1,
            )
            _db.session.add(s)
            _db.session.commit()
            return s.id

    def test_get_active_services(self, client, app):
        sid = self._create_service(app, active=True)
        resp = client.get('/api/services')
        assert resp.status_code == 200
        data = resp.get_json()
        assert any(s['id'] == sid for s in data)

    def test_inactive_hidden_from_public(self, client, app):
        sid = self._create_service(app, active=False)
        resp = client.get('/api/services')
        data = resp.get_json()
        assert not any(s['id'] == sid for s in data)

    def test_get_all_services_admin(self, client, app, auth_headers):
        self._create_service(app, active=False)
        resp = client.get('/api/services/all', headers=auth_headers)
        assert resp.status_code == 200

    def test_create_service(self, client, auth_headers):
        resp = client.post('/api/services', json={
            'title': 'GPS Rental',
            'description': 'Portable GPS device',
            'icon': 'Navigation',
        }, headers=auth_headers)
        assert resp.status_code == 201

    def test_create_service_no_title(self, client, auth_headers):
        resp = client.post('/api/services', json={
            'description': 'No title',
        }, headers=auth_headers)
        assert resp.status_code == 400

    def test_update_service(self, client, app, auth_headers):
        sid = self._create_service(app)
        resp = client.put(f'/api/services/{sid}', json={
            'title': 'Updated Service',
            'is_active': False,
        }, headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_service(self, client, app, auth_headers):
        sid = self._create_service(app)
        resp = client.delete(f'/api/services/{sid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_create_service_requires_admin(self, client):
        resp = client.post('/api/services', json={'title': 'Nope'})
        assert resp.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════
#  CONTRACTS TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestContracts:

    def test_get_contracts_requires_admin(self, client):
        resp = client.get('/api/contracts')
        assert resp.status_code == 401

    def test_get_contracts(self, client, auth_headers):
        resp = client.get('/api/contracts', headers=auth_headers)
        assert resp.status_code == 200

    def test_get_confirmed_bookings(self, client, auth_headers, sample_booking):
        resp = client.get('/api/contracts/confirmed-bookings', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1

    def test_generate_contract_non_confirmed(self, client, app, auth_headers, sample_car):
        """Cannot generate contract for a pending booking."""
        today = date.today()
        with app.app_context():
            b = Booking(
                car_id=sample_car,
                start_date=today + timedelta(days=100),
                end_date=today + timedelta(days=105),
                status='pending',
                customer_name='Pending',
            )
            _db.session.add(b)
            _db.session.commit()
            bid = b.id
        resp = client.post(f'/api/contracts/generate/{bid}', headers=auth_headers)
        assert resp.status_code == 400

    def test_generate_contract_success(self, client, app, auth_headers, sample_booking):
        """Generate contract & invoice for a confirmed booking."""
        resp = client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        assert resp.status_code == 201
        data = resp.get_json()
        assert 'contract_pdf' in data
        assert 'invoice_pdf' in data

    def test_download_contract_pdf(self, client, app, auth_headers, sample_booking):
        """Download a generated contract."""
        # First generate
        client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        # Get contract ID
        with app.app_context():
            contract = Contract.query.filter_by(booking_id=sample_booking).first()
            cid = contract.id
        resp = client.get(f'/api/contracts/download/{cid}/contract', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.content_type == 'application/pdf'

    def test_download_invoice_pdf(self, client, app, auth_headers, sample_booking):
        """Download a generated invoice."""
        client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        with app.app_context():
            contract = Contract.query.filter_by(booking_id=sample_booking).first()
            cid = contract.id
        resp = client.get(f'/api/contracts/download/{cid}/invoice', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.content_type == 'application/pdf'

    def test_download_invalid_doc_type(self, client, app, auth_headers, sample_booking):
        client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        with app.app_context():
            contract = Contract.query.filter_by(booking_id=sample_booking).first()
            cid = contract.id
        resp = client.get(f'/api/contracts/download/{cid}/invalid', headers=auth_headers)
        assert resp.status_code == 400

    def test_regenerate_contract(self, client, auth_headers, sample_booking):
        """Regenerating should update the existing contract record."""
        resp1 = client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        assert resp1.status_code == 201
        resp2 = client.post(f'/api/contracts/generate/{sample_booking}', headers=auth_headers)
        assert resp2.status_code == 201


# ═══════════════════════════════════════════════════════════════════════════
#  PRICE CALCULATION TESTS
# ═══════════════════════════════════════════════════════════════════════════

class TestPriceCalculation:

    def test_total_price_calculated_on_booking(self, client, app):
        """total_price should be duration × price_per_day."""
        with app.app_context():
            car = Car(name='Price Car', category='Economy', price_per_day=250, is_active=True)
            _db.session.add(car)
            _db.session.commit()
            car_id = car.id

        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': car_id,
            'start_date': (today + timedelta(days=50)).isoformat(),
            'end_date': (today + timedelta(days=57)).isoformat(),  # 7 days
            'driver_name': 'Price Test',
            'email': 'price@test.com',
        })
        assert resp.status_code == 201
        assert resp.get_json()['total_price'] == 250 * 7

    def test_zero_price_car(self, client, app):
        """Car with price_per_day=0 should produce total_price=0."""
        with app.app_context():
            car = Car(name='Free Car', category='Promo', price_per_day=0, is_active=True)
            _db.session.add(car)
            _db.session.commit()
            car_id = car.id

        today = date.today()
        resp = client.post('/api/bookings', json={
            'car_id': car_id,
            'start_date': (today + timedelta(days=50)).isoformat(),
            'end_date': (today + timedelta(days=53)).isoformat(),
        })
        assert resp.status_code == 201
        assert resp.get_json()['total_price'] == 0

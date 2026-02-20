from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Booking, Car, CalendarBlock
from app.auth import admin_required
from datetime import datetime, date
from werkzeug.utils import secure_filename
import os, time

bookings_bp = Blueprint('bookings', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_booking_file(file, booking_id):
    """Save a booking document and return its relative URL path."""
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'bookings', str(booking_id))
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    filename = f"{int(time.time())}_{filename}"
    file.save(os.path.join(upload_dir, filename))
    return f"/static/uploads/bookings/{booking_id}/{filename}"


@bookings_bp.route('', methods=['POST'])
def create_booking_request():
    # Support both JSON and multipart/form-data (for file uploads)
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.get_json()
    
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    except (ValueError, KeyError):
        return jsonify({'message': 'Invalid date format (YYYY-MM-DD)'}), 400

    if start_date >= end_date:
        return jsonify({'message': 'End date must be after start date'}), 400

    # Block booking if dates overlap with a confirmed booking or maintenance block
    conflict = Booking.query.filter(
        Booking.car_id == data['car_id'],
        Booking.status == 'confirmed',
        Booking.start_date < end_date,
        Booking.end_date > start_date
    ).first()

    maintenance = CalendarBlock.query.filter(
        CalendarBlock.car_id == data['car_id'],
        CalendarBlock.start_date < end_date,
        CalendarBlock.end_date > start_date
    ).first()

    if conflict or maintenance:
        return jsonify({'message': 'This car is not available for the selected dates. Please choose different dates.'}), 409

    # Calculate total price
    car = Car.query.get(data['car_id'])
    if not car:
        return jsonify({'message': 'Car not found'}), 404
        
    duration = (end_date - start_date).days
    if duration <= 0:
        return jsonify({'message': 'Invalid duration'}), 400
        
    total_price = duration * car.price_per_day

    new_booking = Booking(
        car_id=data['car_id'],
        start_date=start_date,
        end_date=end_date,
        status='pending',
        total_price=total_price,
        customer_name=data.get('driver_name', data.get('customer_name', '')),
        customer_email=data.get('email', data.get('customer_email', '')),
        customer_phone=data.get('phone', data.get('customer_phone', '')),
        customer_details={
            'address_morocco': data.get('address_morocco', ''),
            'address_abroad': data.get('address_abroad', ''),
            'license_number': data.get('license_number', ''),
            'license_issued_at': data.get('license_issued_at', ''),
            'passport': data.get('passport', ''),
            'cin': data.get('cin', ''),
            'cin_valid_until': data.get('cin_valid_until', ''),
            'birth_date': data.get('birth_date', ''),
            'nationality': data.get('nationality', ''),
            'delivery_location': data.get('delivery_location', ''),
            'return_location': data.get('return_location', ''),
        },
    )
    
    db.session.add(new_booking)
    db.session.flush()  # Get the ID before commit to use in file paths

    # Handle document uploads (CIN & License images)
    doc_paths = {}
    for field_name in ['cin_recto', 'cin_verso', 'license_recto', 'license_verso']:
        file = request.files.get(field_name)
        if file and file.filename and allowed_file(file.filename):
            doc_paths[field_name] = save_booking_file(file, new_booking.id)

    if doc_paths:
        details = new_booking.customer_details or {}
        details['documents'] = doc_paths
        new_booking.customer_details = details
        db.session.add(new_booking)  # Mark as dirty for JSONB update

    db.session.commit()
    
    return jsonify({'message': 'Booking request submitted', 'id': new_booking.id, 'total_price': total_price}), 201

@bookings_bp.route('', methods=['GET'])
@admin_required
def get_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'car_id': b.car_id,
            'car_name': b.car.name,
            'customer_name': b.customer_name or 'N/A',
            'customer_email': b.customer_email or '',
            'customer_phone': b.customer_phone or '',
            'customer_details': b.customer_details or {},
            'start_date': b.start_date.isoformat(),
            'end_date': b.end_date.isoformat(),
            'status': b.status,
            'total_price': b.total_price,
            'created_at': b.created_at.isoformat(),
            'has_contract': b.contract is not None,
            'contract_id': b.contract.id if b.contract else None,
        })
    return jsonify(result)

@bookings_bp.route('/<int:id>', methods=['GET'])
@admin_required
def get_booking_detail(id):
    b = Booking.query.get_or_404(id)
    return jsonify({
        'id': b.id,
        'car_id': b.car_id,
        'car_name': b.car.name,
        'customer_name': b.customer_name or 'N/A',
        'customer_email': b.customer_email or '',
        'customer_phone': b.customer_phone or '',
        'customer_details': b.customer_details or {},
        'start_date': b.start_date.isoformat(),
        'end_date': b.end_date.isoformat(),
        'status': b.status,
        'total_price': b.total_price,
        'created_at': b.created_at.isoformat(),
        'has_contract': b.contract is not None,
        'contract_id': b.contract.id if b.contract else None,
    })

@bookings_bp.route('/<int:id>/status', methods=['PATCH'])
@admin_required
def update_booking_status(id):
    booking = Booking.query.get_or_404(id)
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['confirmed', 'cancelled', 'modified']:
        return jsonify({'message': 'Invalid status'}), 400
        
    # Check availability if confirming
    if new_status == 'confirmed':
        conflict = Booking.query.filter(
            Booking.car_id == booking.car_id,
            Booking.status == 'confirmed',
            Booking.id != booking.id,
            Booking.start_date < booking.end_date,
            Booking.end_date > booking.start_date
        ).first()
        
        maintenance = CalendarBlock.query.filter(
            CalendarBlock.car_id == booking.car_id,
            CalendarBlock.start_date < booking.end_date,
            CalendarBlock.end_date > booking.start_date
        ).first()
        
        if conflict or maintenance:
            return jsonify({'message': 'Car is not available for these dates'}), 409

    booking.status = new_status
    db.session.commit()
    return jsonify({'message': f'Booking {new_status}'})

@bookings_bp.route('/availability/<int:car_id>', methods=['GET'])
def get_availability(car_id):
    # Determine the strict availability for a car for a given month/range
    # For simplicity, returning confirmed bookings and maintenance blocks
    confirmed = Booking.query.filter_by(car_id=car_id, status='confirmed').all()
    blocks = CalendarBlock.query.filter_by(car_id=car_id).all()
    
    unavailable_ranges = []
    for b in confirmed:
        unavailable_ranges.append({'start': b.start_date.isoformat(), 'end': b.end_date.isoformat(), 'type': 'booking'})
        
    for b in blocks:
        unavailable_ranges.append({'start': b.start_date.isoformat(), 'end': b.end_date.isoformat(), 'type': b.reason})
        
    return jsonify(unavailable_ranges)

from flask import Blueprint, request, jsonify
from app import db
from app.models import Booking, Car, CalendarBlock
from app.auth import admin_required
from datetime import datetime, date

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['POST'])
def create_booking_request():
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

    new_booking = Booking(
        car_id=data['car_id'],
        start_date=start_date,
        end_date=end_date,
        status='pending',
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
    db.session.commit()
    
    return jsonify({'message': 'Booking request submitted', 'id': new_booking.id}), 201

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
            'start_date': b.start_date.isoformat(),
            'end_date': b.end_date.isoformat(),
            'status': b.status,
            'created_at': b.created_at.isoformat(),
            'has_contract': b.contract is not None,
            'contract_id': b.contract.id if b.contract else None,
        })
    return jsonify(result)

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

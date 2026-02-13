from flask import Blueprint, request, jsonify, send_file, current_app
from app import db
from app.models import Booking, Car, Contract
from app.auth import admin_required
from app.pdf_generator import generate_contract_pdf, generate_invoice_pdf
import os
from datetime import datetime

contracts_bp = Blueprint('contracts', __name__)


@contracts_bp.route('', methods=['GET'])
@admin_required
def get_contracts():
    """List all contracts with their booking details."""
    contracts = Contract.query.order_by(Contract.created_at.desc()).all()
    result = []
    for c in contracts:
        booking = c.booking
        car = booking.car if booking else None
        result.append({
            'id': c.id,
            'booking_id': c.booking_id,
            'car_name': car.name if car else 'N/A',
            'customer_name': booking.customer_name or 'N/A' if booking else 'N/A',
            'start_date': booking.start_date.isoformat() if booking else None,
            'end_date': booking.end_date.isoformat() if booking else None,
            'status': booking.status if booking else 'N/A',
            'has_contract_pdf': bool(c.pdf_path),
            'has_invoice_pdf': bool(c.invoice_data and c.invoice_data.get('invoice_path')),
            'created_at': c.created_at.isoformat(),
        })
    return jsonify(result)


@contracts_bp.route('/confirmed-bookings', methods=['GET'])
@admin_required
def get_confirmed_bookings():
    """List confirmed bookings that can have contracts generated."""
    bookings = Booking.query.filter_by(status='confirmed').order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        car = b.car
        has_contract = b.contract is not None
        result.append({
            'id': b.id,
            'car_name': car.name if car else 'N/A',
            'car_id': b.car_id,
            'customer_name': b.customer_name or 'N/A',
            'customer_email': b.customer_email or '',
            'customer_phone': b.customer_phone or '',
            'start_date': b.start_date.isoformat(),
            'end_date': b.end_date.isoformat(),
            'created_at': b.created_at.isoformat(),
            'has_contract': has_contract,
            'contract_id': b.contract.id if has_contract else None,
        })
    return jsonify(result)


@contracts_bp.route('/generate/<int:booking_id>', methods=['POST'])
@admin_required
def generate_contract(booking_id):
    """Generate contract and invoice PDFs for a confirmed booking."""
    booking = Booking.query.get_or_404(booking_id)

    if booking.status != 'confirmed':
        return jsonify({'message': 'Can only generate contracts for confirmed bookings'}), 400

    car = Car.query.get(booking.car_id)
    if not car:
        return jsonify({'message': 'Car not found'}), 404

    # Create output directory
    output_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'contracts')
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Generate contract PDF
    contract_filename = f"contrat_{booking_id}_{timestamp}.pdf"
    contract_path = os.path.join(output_dir, contract_filename)
    generate_contract_pdf(booking, car, contract_path)

    # Generate invoice PDF  
    invoice_filename = f"facture_{booking_id}_{timestamp}.pdf"
    invoice_path = os.path.join(output_dir, invoice_filename)
    generate_invoice_pdf(booking, car, invoice_path)

    # Save or update contract record
    contract = Contract.query.filter_by(booking_id=booking_id).first()
    if contract:
        contract.pdf_path = contract_filename
        contract.invoice_data = {
            'invoice_path': invoice_filename,
            'generated_at': datetime.now().isoformat(),
            'total_days': (booking.end_date - booking.start_date).days,
        }
        contract.created_at = datetime.now()
    else:
        contract = Contract(
            booking_id=booking_id,
            pdf_path=contract_filename,
            invoice_data={
                'invoice_path': invoice_filename,
                'generated_at': datetime.now().isoformat(),
                'total_days': (booking.end_date - booking.start_date).days,
            }
        )
        db.session.add(contract)

    db.session.commit()

    return jsonify({
        'message': 'Contract and invoice generated successfully',
        'contract_id': contract.id,
        'contract_pdf': contract_filename,
        'invoice_pdf': invoice_filename,
    }), 201


@contracts_bp.route('/download/<int:contract_id>/<string:doc_type>', methods=['GET'])
@admin_required
def download_document(contract_id, doc_type):
    """Download a contract or invoice PDF."""
    contract = Contract.query.get_or_404(contract_id)

    output_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'contracts')

    if doc_type == 'contract':
        if not contract.pdf_path:
            return jsonify({'message': 'Contract PDF not found'}), 404
        file_path = os.path.join(output_dir, contract.pdf_path)
        filename = f"Contrat_{contract.booking_id}.pdf"
    elif doc_type == 'invoice':
        if not contract.invoice_data or not contract.invoice_data.get('invoice_path'):
            return jsonify({'message': 'Invoice PDF not found'}), 404
        file_path = os.path.join(output_dir, contract.invoice_data['invoice_path'])
        filename = f"Facture_{contract.booking_id}.pdf"
    else:
        return jsonify({'message': 'Invalid document type. Use "contract" or "invoice"'}), 400

    if not os.path.exists(file_path):
        return jsonify({'message': 'PDF file not found on disk'}), 404

    return send_file(file_path, as_attachment=True, download_name=filename, mimetype='application/pdf')

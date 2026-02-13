from flask import Blueprint, request, jsonify
from app import db
from app.models import Service
from app.auth import admin_required

services_bp = Blueprint('services', __name__)


@services_bp.route('', methods=['GET'])
def get_services():
    """Public: get all active services."""
    services = Service.query.filter_by(is_active=True).order_by(Service.sort_order.asc()).all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'description': s.description,
        'icon': s.icon,
    } for s in services])


@services_bp.route('/all', methods=['GET'])
@admin_required
def get_all_services():
    """Admin: get all services including inactive."""
    services = Service.query.order_by(Service.sort_order.asc()).all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'description': s.description,
        'icon': s.icon,
        'is_active': s.is_active,
        'sort_order': s.sort_order,
    } for s in services])


@services_bp.route('', methods=['POST'])
@admin_required
def create_service():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    service = Service(
        title=data['title'],
        description=data.get('description', ''),
        icon=data.get('icon', 'Shield'),
        is_active=data.get('is_active', True),
        sort_order=data.get('sort_order', 0),
    )
    db.session.add(service)
    db.session.commit()
    return jsonify({'message': 'Service created', 'id': service.id}), 201


@services_bp.route('/<int:service_id>', methods=['PUT'])
@admin_required
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()

    service.title = data.get('title', service.title)
    service.description = data.get('description', service.description)
    service.icon = data.get('icon', service.icon)
    service.is_active = data.get('is_active', service.is_active)
    service.sort_order = data.get('sort_order', service.sort_order)

    db.session.commit()
    return jsonify({'message': 'Service updated'})


@services_bp.route('/<int:service_id>', methods=['DELETE'])
@admin_required
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted'})

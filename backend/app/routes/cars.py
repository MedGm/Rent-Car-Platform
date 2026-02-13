from flask import Blueprint, request, jsonify
from app.models import Car, db
from app.auth import admin_required

cars_bp = Blueprint('cars', __name__)

@cars_bp.route('/', methods=['GET'])
def get_cars():
    # Public endpoint to list active cars
    cars = Car.query.filter_by(is_active=True).all()
    result = []
    for car in cars:
        result.append({
            'id': car.id,
            'name': car.name,
            'category': car.category,
            'specs': car.specs,
            'images': car.images,
            'is_active': car.is_active
        })
    return jsonify(result)

@cars_bp.route('/<int:id>', methods=['GET'])
def get_car(id):
    # Public endpoint to get car details
    car = Car.query.get_or_404(id)
    return jsonify({
        'id': car.id,
        'name': car.name,
        'category': car.category,
        'specs': car.specs,
        'images': car.images,
        'is_active': car.is_active
    })

@cars_bp.route('/', methods=['POST'])
@admin_required
def create_car():
    data = request.get_json()
    new_car = Car(
        name=data['name'],
        category=data.get('category'),
        specs=data.get('specs', {}),
        images=data.get('images', []),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_car)
    db.session.commit()
    return jsonify({'message': 'Car created successfully', 'id': new_car.id}), 201

@cars_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_car(id):
    car = Car.query.get_or_404(id)
    data = request.get_json()
    
    car.name = data.get('name', car.name)
    car.category = data.get('category', car.category)
    car.specs = data.get('specs', car.specs)
    car.images = data.get('images', car.images)
    car.is_active = data.get('is_active', car.is_active)
    
    db.session.commit()
    return jsonify({'message': 'Car updated successfully'})

@cars_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_car(id):
    car = Car.query.get_or_404(id)
    # Soft delete
    car.is_active = False
    db.session.commit()
    return jsonify({'message': 'Car deactivated successfully'})

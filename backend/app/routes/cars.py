import os
import json
import time
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import Car, db
from app.auth import admin_required

cars_bp = Blueprint('cars', __name__)

@cars_bp.route('', methods=['GET'])
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
            'brand_logo': car.brand_logo,
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
        'brand_logo': car.brand_logo,
        'is_active': car.is_active
    })

@cars_bp.route('', methods=['POST'])
@admin_required
def create_car():
    try:
        data = request.form
        files = request.files.getlist('images')
        
        image_urls = []
        if files:
            upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cars')
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in files:
                if file and file.filename:
                    filename = secure_filename(file.filename)
                    timestamp = int(time.time())
                    filename = f"{timestamp}_{filename}"
                    
                    file.save(os.path.join(upload_dir, filename))
                    image_urls.append(f"{request.host_url}static/uploads/cars/{filename}")

        # Handle brand logo upload
        brand_logo_url = ''
        brand_logo_file = request.files.get('brand_logo')
        if brand_logo_file and brand_logo_file.filename:
            logo_filename = secure_filename(brand_logo_file.filename)
            logo_filename = f"{int(time.time())}_{logo_filename}"
            logo_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cars')
            os.makedirs(logo_dir, exist_ok=True)
            brand_logo_file.save(os.path.join(logo_dir, logo_filename))
            brand_logo_url = f"{request.host_url}static/uploads/cars/{logo_filename}"

        # Specs come as stringified JSON in formData
        specs = json.loads(data.get('specs', '{}'))
        
        new_car = Car(
            name=data['name'],
            category=data.get('category'),
            specs=specs,
            images=image_urls,
            brand_logo=brand_logo_url or None,
            is_active=data.get('is_active') == 'true'
        )
        db.session.add(new_car)
        db.session.commit()
        return jsonify({'message': 'Car created successfully', 'id': new_car.id}), 201
    except Exception as e:
        return jsonify({'message': f'Error creating car: {str(e)}'}), 500

@cars_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_car(id):
    car = Car.query.get_or_404(id)
    
    try:
        # Check if request is JSON (metadata update only) or FormData (file upload)
        if request.is_json:
            data = request.get_json()
            car.name = data.get('name', car.name)
            car.category = data.get('category', car.category)
            car.specs = data.get('specs', car.specs)
            car.images = data.get('images', car.images)
            car.is_active = data.get('is_active', car.is_active)
        else:
            data = request.form
            files = request.files.getlist('images')
            
            # Handle new image uploads
            new_image_urls = []
            if files:
                upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cars')
                os.makedirs(upload_dir, exist_ok=True)
                
                for file in files:
                    if file and file.filename:
                        filename = secure_filename(file.filename)
                        timestamp = int(time.time())
                        filename = f"{timestamp}_{filename}"
                        file.save(os.path.join(upload_dir, filename))
                        new_image_urls.append(f"{request.host_url}static/uploads/cars/{filename}")
            
            car.name = data.get('name', car.name)
            car.category = data.get('category', car.category)
            
            if 'specs' in data:
                car.specs = json.loads(data['specs'])
                
            if 'is_active' in data:
                car.is_active = data.get('is_active') == 'true'

            # If existing_images provided (to keep old ones), merge them
            # This logic depends on how frontend sends data. 
            # If frontend sends 'images' as list of URLs, it might come in via form as multiple values?
            # Simplified: if new files uploaded, append them. 
            # If we want to replace, frontend should send a flag or we assume append.
            # Let's assume WE APPEND by default if files are present, 
            # UNLESS a specific "clear_images" flag is sent?
            # Better approach for simplicity: Frontend sends "existing_images" as JSON list.
            
            existing_images = []
            if 'existing_images' in data:
                existing_images = json.loads(data['existing_images'])
            elif not files: 
                 # If no files and no existing_images specified (but form used), 
                 # safeguard to not wipe images unless intended?
                 # Actually, usually PUT replaces state.
                 # Let's trust 'existing_images'. If not present, it defaults emptiness?
                 # To be safe, if NOT in data, keep current? 
                 # But in FormData, missing key means user didn't send it.
                 # Let's assume:
                 # 1. new files -> uploaded and added to list
                 # 2. existing_images -> list of old urls to KEEP
                 # Result = existing_images + new_image_urls
                 pass

            # Update logic:
            # If 'existing_images' is passed, we use it as base. Else we default to empty (wipe) OR keep current?
            # Standard PUT replaces.
            # But converting mixed JSON/File is tricky.
            # Let's use this strategy:
            # Result Images = (JSON parsed 'existing_images' OR []) + New Uploads
            
            final_images = existing_images + new_image_urls
            
            # Only update images if we actually processed some image logic (either files or existing_images key present)
            if files or 'existing_images' in data:
                car.images = final_images

            # Handle brand logo upload
            brand_logo_file = request.files.get('brand_logo')
            if brand_logo_file and brand_logo_file.filename:
                logo_filename = secure_filename(brand_logo_file.filename)
                logo_filename = f"{int(time.time())}_{logo_filename}"
                logo_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cars')
                os.makedirs(logo_dir, exist_ok=True)
                brand_logo_file.save(os.path.join(logo_dir, logo_filename))
                car.brand_logo = f"{request.host_url}static/uploads/cars/{logo_filename}"
            elif data.get('remove_brand_logo') == 'true':
                car.brand_logo = None

        db.session.commit()
        return jsonify({'message': 'Car updated successfully'})
        
    except Exception as e:
        return jsonify({'message': f'Error updating car: {str(e)}'}), 500

@cars_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_car(id):
    car = Car.query.get_or_404(id)
    # Soft delete
    car.is_active = False
    db.session.commit()
    return jsonify({'message': 'Car deactivated successfully'})

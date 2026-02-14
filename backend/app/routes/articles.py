from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Article
from app.auth import admin_required
import os
import time
from werkzeug.utils import secure_filename

articles_bp = Blueprint('articles', __name__)


def _save_article_image(file):
    """Save an uploaded article image and return its URL."""
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'articles')
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    filename = f"{int(time.time())}_{filename}"
    file.save(os.path.join(upload_dir, filename))
    return f"{request.host_url}static/uploads/articles/{filename}"


@articles_bp.route('', methods=['GET'])
def get_articles():
    """Public: get all published articles."""
    articles = Article.query.filter_by(is_published=True).order_by(Article.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'excerpt': a.excerpt,
        'content': a.content,
        'category': a.category,
        'image_url': a.image_url,
        'created_at': a.created_at.strftime('%b %d, %Y') if a.created_at else None,
    } for a in articles])


@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Public: get a single published article by ID."""
    article = Article.query.get_or_404(article_id)
    if not article.is_published:
        return jsonify({'error': 'Article not found'}), 404
    return jsonify({
        'id': article.id,
        'title': article.title,
        'excerpt': article.excerpt,
        'content': article.content,
        'category': article.category,
        'image_url': article.image_url,
        'created_at': article.created_at.strftime('%b %d, %Y') if article.created_at else None,
    })


@articles_bp.route('/all', methods=['GET'])
@admin_required
def get_all_articles():
    """Admin: get all articles including unpublished."""
    articles = Article.query.order_by(Article.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'excerpt': a.excerpt,
        'content': a.content,
        'category': a.category,
        'image_url': a.image_url,
        'is_published': a.is_published,
        'created_at': a.created_at.strftime('%Y-%m-%d %H:%M') if a.created_at else None,
        'updated_at': a.updated_at.strftime('%Y-%m-%d %H:%M') if a.updated_at else None,
    } for a in articles])


@articles_bp.route('', methods=['POST'])
@admin_required
def create_article():
    # Support both JSON and FormData
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
        image_file = request.files.get('image')
        image_url = ''
        if image_file and image_file.filename:
            image_url = _save_article_image(image_file)
    else:
        data = request.get_json() or {}
        image_url = data.get('image_url', '')

    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    article = Article(
        title=data['title'],
        excerpt=data.get('excerpt', ''),
        content=data.get('content', ''),
        category=data.get('category', ''),
        image_url=image_url,
        is_published=data.get('is_published', 'true') in (True, 'true', '1', 'on'),
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'message': 'Article created', 'id': article.id}), 201


@articles_bp.route('/<int:article_id>', methods=['PUT'])
@admin_required
def update_article(article_id):
    article = Article.query.get_or_404(article_id)

    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
        image_file = request.files.get('image')
        if image_file and image_file.filename:
            article.image_url = _save_article_image(image_file)
        # If keep_image is 'false', clear the image
        if data.get('remove_image') == 'true':
            article.image_url = ''
    else:
        data = request.get_json() or {}
        if 'image_url' in data:
            article.image_url = data['image_url']

    if 'title' in data:
        article.title = data['title']
    if 'excerpt' in data:
        article.excerpt = data['excerpt']
    if 'content' in data:
        article.content = data['content']
    if 'category' in data:
        article.category = data['category']
    if 'is_published' in data:
        val = data['is_published']
        article.is_published = val in (True, 'true', '1', 'on')

    db.session.commit()
    return jsonify({'message': 'Article updated'})


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@admin_required
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted'})

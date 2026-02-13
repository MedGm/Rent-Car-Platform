from flask import Blueprint, request, jsonify
from app import db
from app.models import Article
from app.auth import admin_required

articles_bp = Blueprint('articles', __name__)


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
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    article = Article(
        title=data['title'],
        excerpt=data.get('excerpt', ''),
        content=data.get('content', ''),
        category=data.get('category', ''),
        image_url=data.get('image_url', ''),
        is_published=data.get('is_published', True),
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'message': 'Article created', 'id': article.id}), 201


@articles_bp.route('/<int:article_id>', methods=['PUT'])
@admin_required
def update_article(article_id):
    article = Article.query.get_or_404(article_id)
    data = request.get_json()

    article.title = data.get('title', article.title)
    article.excerpt = data.get('excerpt', article.excerpt)
    article.content = data.get('content', article.content)
    article.category = data.get('category', article.category)
    article.image_url = data.get('image_url', article.image_url)
    article.is_published = data.get('is_published', article.is_published)

    db.session.commit()
    return jsonify({'message': 'Article updated'})


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@admin_required
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted'})

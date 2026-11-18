from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models import db
from app.models.notice import Notice

notice_bp = Blueprint('notices', __name__, url_prefix='/api')


@notice_bp.route('/notices', methods=['GET'])
def get_notices():
    category = request.args.get('category')
    department = request.args.get('department')
    q = request.args.get('q')
    pinned = request.args.get('pinned')

    query = Notice.query.filter_by(is_published=True, is_draft=False)

    # Exclude expired notices
    now = datetime.utcnow()
    query = query.filter(
        (Notice.expires_at == None) | (Notice.expires_at > now)
    )

    if category:
        query = query.filter_by(category=category)
    if department:
        query = query.filter_by(department=department)
    if pinned and pinned.lower() in ('true', '1'):
        query = query.filter_by(is_pinned=True)
    if q:
        query = query.filter(
            (Notice.title.ilike(f'%{q}%')) | (Notice.content.ilike(f'%{q}%'))
        )

    # Order: pinned first, then by published_at desc
    notices = query.order_by(Notice.is_pinned.desc(), Notice.published_at.desc()).all()
    return jsonify([n.to_dict() for n in notices]), 200


@notice_bp.route('/notices/<int:notice_id>', methods=['GET'])
def get_notice(notice_id):
    notice = Notice.query.get_or_404(notice_id)
    return jsonify(notice.to_dict()), 200

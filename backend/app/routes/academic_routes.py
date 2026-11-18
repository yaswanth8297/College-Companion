from flask import Blueprint, request, jsonify
from app.models import db
from app.models.academic import AcademicResource

academic_bp = Blueprint('academic', __name__, url_prefix='/api')


@academic_bp.route('/academic', methods=['GET'])
def get_academic_resources():
    section = request.args.get('section')

    query = AcademicResource.query.filter_by(is_published=True)

    if section:
        query = query.filter_by(section=section)

    resources = query.order_by(AcademicResource.display_order).all()
    return jsonify([r.to_dict() for r in resources]), 200

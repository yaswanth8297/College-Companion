from flask import Blueprint, request, jsonify
from app.models import db
from app.models.faculty import Faculty

faculty_bp = Blueprint('faculty', __name__, url_prefix='/api')


@faculty_bp.route('/faculty', methods=['GET'])
def get_faculty():
    department = request.args.get('department')
    designation = request.args.get('designation')
    q = request.args.get('q')

    query = Faculty.query.filter_by(is_published=True)

    if department:
        query = query.filter_by(department=department)
    if designation:
        query = query.filter_by(designation=designation)
    if q:
        query = query.filter(Faculty.name.ilike(f'%{q}%'))

    # Order: by department, HOD first, then display_order
    faculty = query.order_by(
        Faculty.department,
        Faculty.is_hod.desc(),
        Faculty.display_order
    ).all()
    return jsonify([f.to_dict() for f in faculty]), 200


@faculty_bp.route('/faculty/<int:faculty_id>', methods=['GET'])
def get_faculty_member(faculty_id):
    member = Faculty.query.get_or_404(faculty_id)
    return jsonify(member.to_dict()), 200

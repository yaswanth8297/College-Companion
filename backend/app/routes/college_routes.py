from flask import Blueprint, jsonify, request
from app.models.college import CollegeInfo, Department, Facility, AdmissionInfo

college_bp = Blueprint('college', __name__, url_prefix='/api')

@college_bp.route('/college', methods=['GET'])
def get_college_info():
    info = CollegeInfo.query.first()
    if not info:
        return jsonify({'error': 'College information not found'}), 404
    return jsonify(info.to_dict()), 200

@college_bp.route('/departments', methods=['GET'])
def get_departments():
    # Regular visitors only see published departments
    include_unpublished = request.args.get('all', 'false').lower() == 'true'
    if include_unpublished:
        depts = Department.query.order_by(Department.id).all()
    else:
        depts = Department.query.filter_by(is_published=True).order_by(Department.id).all()
    return jsonify([d.to_dict() for d in depts]), 200

@college_bp.route('/departments/<identifier>', methods=['GET'])
def get_department(identifier):
    if identifier.isdigit():
        dept = Department.query.get(int(identifier))
    else:
        dept = Department.query.filter_by(code=identifier.upper()).first()
        
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    return jsonify(dept.to_dict()), 200

@college_bp.route('/facilities', methods=['GET'])
def get_facilities():
    category = request.args.get('category')
    query = Facility.query.filter_by(is_published=True)
    if category:
        query = query.filter_by(category=category)
    facilities = query.order_by(Facility.id).all()
    return jsonify([f.to_dict() for f in facilities]), 200

@college_bp.route('/admissions', methods=['GET'])
def get_admissions():
    admissions = AdmissionInfo.query.order_by(AdmissionInfo.id).all()
    return jsonify([a.to_dict() for a in admissions]), 200

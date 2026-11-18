from flask import Blueprint, request, jsonify
from app.models import db
from app.models.grievance import Grievance

grievance_bp = Blueprint('grievances', __name__, url_prefix='/api')


@grievance_bp.route('/grievances', methods=['POST'])
def submit_grievance():
    data = request.get_json() or {}

    # Validate required fields
    required = ['student_name', 'subject', 'description']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    grievance = Grievance(
        student_name=data['student_name'],
        subject=data['subject'],
        description=data['description'],
        student_id=data.get('student_id'),
        department=data.get('department'),
        category=data.get('category', 'general'),
        attachment_url=data.get('attachment_url'),
        contact_email=data.get('contact_email'),
    )
    db.session.add(grievance)
    db.session.commit()

    return jsonify({
        'message': 'Grievance submitted successfully.',
        'reference_number': grievance.reference_number,
        'status': grievance.status,
    }), 201


@grievance_bp.route('/grievances/status/<reference_number>', methods=['GET'])
def get_grievance_status(reference_number):
    grievance = Grievance.query.filter_by(reference_number=reference_number).first()
    if not grievance:
        return jsonify({'error': 'Grievance not found. Please check your reference number.'}), 404
    # Return limited public fields only
    return jsonify(grievance.to_dict(admin_view=False)), 200

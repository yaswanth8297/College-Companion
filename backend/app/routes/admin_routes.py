import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from app.models import db
from app.models.college import CollegeInfo, Department, Facility, AdmissionInfo, Course, DepartmentLab
from app.models.navigation import CampusLocation, CampusPathway
from app.models.chat import FAQKnowledge, UnansweredQuestion, Feedback

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- FILE UPLOAD ---
@admin_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        file.save(upload_path)
        file_url = f"/uploads/{filename}"
        return jsonify({'url': file_url}), 201
    return jsonify({'error': 'File format not allowed'}), 400

# --- COLLEGE INFO ---
@admin_bp.route('/college', methods=['PUT'])
@jwt_required()
def update_college():
    data = request.get_json() or {}
    college = CollegeInfo.query.first()
    if not college:
        college = CollegeInfo()
        db.session.add(college)

    for field in ['name', 'short_name', 'tagline', 'overview', 'vision', 'mission', 'history', 'address', 'city', 'state', 'pincode', 'phone', 'email', 'website', 'affiliation', 'approval', 'principal_name']:
        if field in data:
            setattr(college, field, data[field])
    
    db.session.commit()
    return jsonify({'message': 'College information updated', 'college': college.to_dict()}), 200

# --- LOCATIONS (Graph Nodes) ---
@admin_bp.route('/locations', methods=['POST'])
@jwt_required()
def create_location():
    data = request.get_json() or {}
    required = ['name', 'category', 'latitude', 'longitude']
    for req in required:
        if req not in data:
            return jsonify({'error': f"Missing required field: {req}"}), 400

    slug = data.get('slug')
    if not slug:
        slug = data['name'].lower().replace(' ', '_').replace('-', '_')
        # Ensure unique slug
        base_slug = slug
        count = 1
        while CampusLocation.query.filter_by(slug=slug).first():
            slug = f"{base_slug}_{count}"
            count += 1

    loc = CampusLocation(
        slug=slug,
        name=data['name'],
        category=data['category'],
        latitude=float(data['latitude']),
        longitude=float(data['longitude']),
        floor_level=data.get('floor_level', 'Ground Floor'),
        block_name=data.get('block_name', ''),
        description=data.get('description', ''),
        accessibility_info=data.get('accessibility_info', 'Wheelchair accessible'),
        is_navigable_destination=data.get('is_navigable_destination', True),
        is_verified=data.get('is_verified', True)
    )
    db.session.add(loc)
    db.session.commit()
    return jsonify(loc.to_dict()), 201

@admin_bp.route('/locations/<int:loc_id>', methods=['PUT'])
@jwt_required()
def update_location(loc_id):
    loc = CampusLocation.query.get(loc_id)
    if not loc:
        return jsonify({'error': 'Location not found'}), 404

    data = request.get_json() or {}
    for key in ['name', 'slug', 'category', 'floor_level', 'block_name', 'description', 'accessibility_info']:
        if key in data:
            setattr(loc, key, data[key])

    if 'latitude' in data:
        loc.latitude = float(data['latitude'])
    if 'longitude' in data:
        loc.longitude = float(data['longitude'])
    if 'is_navigable_destination' in data:
        loc.is_navigable_destination = bool(data['is_navigable_destination'])
    if 'is_verified' in data:
        loc.is_verified = bool(data['is_verified'])

    db.session.commit()
    return jsonify(loc.to_dict()), 200

@admin_bp.route('/locations/<int:loc_id>', methods=['DELETE'])
@jwt_required()
def delete_location(loc_id):
    loc = CampusLocation.query.get(loc_id)
    if not loc:
        return jsonify({'error': 'Location not found'}), 404
        
    # Remove associated pathways
    CampusPathway.query.filter((CampusPathway.from_node_id == loc_id) | (CampusPathway.to_node_id == loc_id)).delete()
    db.session.delete(loc)
    db.session.commit()
    return jsonify({'message': 'Location deleted successfully'}), 200

# --- PATHWAYS (Graph Edges) ---
@admin_bp.route('/pathways', methods=['POST'])
@jwt_required()
def create_pathway():
    data = request.get_json() or {}
    from_id = data.get('from_node_id')
    to_id = data.get('to_node_id')
    dist = data.get('distance_meters')

    if not from_id or not to_id or dist is None:
        return jsonify({'error': 'from_node_id, to_node_id, and distance_meters are required'}), 400

    pathway = CampusPathway(
        from_node_id=int(from_id),
        to_node_id=int(to_id),
        distance_meters=float(dist),
        pathway_type=data.get('pathway_type', 'walkway'),
        is_bidirectional=data.get('is_bidirectional', True),
        is_accessible=data.get('is_accessible', True),
        instructions_forward=data.get('instructions_forward', ''),
        instructions_reverse=data.get('instructions_reverse', '')
    )
    db.session.add(pathway)
    db.session.commit()
    return jsonify(pathway.to_dict()), 201

@admin_bp.route('/pathways/<int:pathway_id>', methods=['PUT'])
@jwt_required()
def update_pathway(pathway_id):
    p = CampusPathway.query.get(pathway_id)
    if not p:
        return jsonify({'error': 'Pathway not found'}), 404

    data = request.get_json() or {}
    if 'distance_meters' in data:
        p.distance_meters = float(data['distance_meters'])
    if 'pathway_type' in data:
        p.pathway_type = data['pathway_type']
    if 'is_bidirectional' in data:
        p.is_bidirectional = bool(data['is_bidirectional'])
    if 'is_accessible' in data:
        p.is_accessible = bool(data['is_accessible'])
    if 'instructions_forward' in data:
        p.instructions_forward = data['instructions_forward']
    if 'instructions_reverse' in data:
        p.instructions_reverse = data['instructions_reverse']

    db.session.commit()
    return jsonify(p.to_dict()), 200

@admin_bp.route('/pathways/<int:pathway_id>', methods=['DELETE'])
@jwt_required()
def delete_pathway(pathway_id):
    p = CampusPathway.query.get(pathway_id)
    if not p:
        return jsonify({'error': 'Pathway not found'}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Pathway deleted successfully'}), 200

# --- DEPARTMENTS ---
@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    data = request.get_json() or {}
    if not data.get('code') or not data.get('name') or not data.get('description'):
        return jsonify({'error': 'Code, name, and description are required'}), 400

    dept = Department(
        code=data['code'].upper(),
        name=data['name'],
        description=data['description'],
        head_of_department=data.get('head_of_department'),
        established_year=data.get('established_year'),
        student_intake=data.get('student_intake', 60),
        location_id=data.get('location_id'),
        block_info=data.get('block_info'),
        contact_email=data.get('contact_email'),
        is_published=data.get('is_published', True),
        is_verified=data.get('is_verified', True)
    )
    db.session.add(dept)
    db.session.commit()
    return jsonify(dept.to_dict()), 201

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@jwt_required()
def update_department(dept_id):
    dept = Department.query.get(dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404

    data = request.get_json() or {}
    for key in ['code', 'name', 'description', 'head_of_department', 'block_info', 'contact_email']:
        if key in data:
            setattr(dept, key, data[key])
    if 'established_year' in data:
        dept.established_year = int(data['established_year']) if data['established_year'] else None
    if 'student_intake' in data:
        dept.student_intake = int(data['student_intake']) if data['student_intake'] else 60
    if 'location_id' in data:
        dept.location_id = int(data['location_id']) if data['location_id'] else None
    if 'is_published' in data:
        dept.is_published = bool(data['is_published'])
    if 'is_verified' in data:
        dept.is_verified = bool(data['is_verified'])

    db.session.commit()
    return jsonify(dept.to_dict()), 200

@admin_bp.route('/departments/<int:dept_id>/toggle-publish', methods=['PATCH'])
@jwt_required()
def toggle_department_publish(dept_id):
    dept = Department.query.get(dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    dept.is_published = not dept.is_published
    db.session.commit()
    return jsonify({'is_published': dept.is_published}), 200

@admin_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@jwt_required()
def delete_department(dept_id):
    dept = Department.query.get(dept_id)
    if not dept:
        return jsonify({'error': 'Department not found'}), 404
    db.session.delete(dept)
    db.session.commit()
    return jsonify({'message': 'Department deleted successfully'}), 200

# --- FACILITIES ---
@admin_bp.route('/facilities', methods=['POST'])
@jwt_required()
def create_facility():
    data = request.get_json() or {}
    if not data.get('name') or not data.get('description'):
        return jsonify({'error': 'Name and description are required'}), 400

    fac = Facility(
        name=data['name'],
        category=data.get('category', 'amenity'),
        description=data['description'],
        operating_hours=data.get('operating_hours'),
        location_id=data.get('location_id'),
        image_url=data.get('image_url'),
        is_published=data.get('is_published', True),
        is_verified=data.get('is_verified', True)
    )
    db.session.add(fac)
    db.session.commit()
    return jsonify(fac.to_dict()), 201

@admin_bp.route('/facilities/<int:fac_id>', methods=['PUT'])
@jwt_required()
def update_facility(fac_id):
    fac = Facility.query.get(fac_id)
    if not fac:
        return jsonify({'error': 'Facility not found'}), 404

    data = request.get_json() or {}
    for key in ['name', 'category', 'description', 'operating_hours', 'image_url']:
        if key in data:
            setattr(fac, key, data[key])
    if 'location_id' in data:
        fac.location_id = int(data['location_id']) if data['location_id'] else None
    if 'is_published' in data:
        fac.is_published = bool(data['is_published'])
    if 'is_verified' in data:
        fac.is_verified = bool(data['is_verified'])

    db.session.commit()
    return jsonify(fac.to_dict()), 200

@admin_bp.route('/facilities/<int:fac_id>', methods=['DELETE'])
@jwt_required()
def delete_facility(fac_id):
    fac = Facility.query.get(fac_id)
    if not fac:
        return jsonify({'error': 'Facility not found'}), 404
    db.session.delete(fac)
    db.session.commit()
    return jsonify({'message': 'Facility deleted successfully'}), 200

# --- FAQS & KNOWLEDGE BASE ---
@admin_bp.route('/faqs', methods=['GET'])
@jwt_required()
def get_admin_faqs():
    faqs = FAQKnowledge.query.order_by(FAQKnowledge.id.desc()).all()
    return jsonify([f.to_dict() for f in faqs]), 200

@admin_bp.route('/faqs', methods=['POST'])
@jwt_required()
def create_faq():
    data = request.get_json() or {}
    if not data.get('question') or not data.get('answer'):
        return jsonify({'error': 'Question and answer are required'}), 400

    faq = FAQKnowledge(
        category=data.get('category', 'general'),
        question=data['question'],
        answer=data['answer'],
        keywords=data.get('keywords', ''),
        is_verified=data.get('is_verified', True),
        is_published=data.get('is_published', True)
    )
    db.session.add(faq)
    db.session.commit()
    return jsonify(faq.to_dict()), 201

@admin_bp.route('/faqs/<int:faq_id>', methods=['PUT'])
@jwt_required()
def update_faq(faq_id):
    faq = FAQKnowledge.query.get(faq_id)
    if not faq:
        return jsonify({'error': 'FAQ not found'}), 404

    data = request.get_json() or {}
    for key in ['category', 'question', 'answer', 'keywords']:
        if key in data:
            setattr(faq, key, data[key])
    if 'is_verified' in data:
        faq.is_verified = bool(data['is_verified'])
    if 'is_published' in data:
        faq.is_published = bool(data['is_published'])

    db.session.commit()
    return jsonify(faq.to_dict()), 200

@admin_bp.route('/faqs/<int:faq_id>', methods=['DELETE'])
@jwt_required()
def delete_faq(faq_id):
    faq = FAQKnowledge.query.get(faq_id)
    if not faq:
        return jsonify({'error': 'FAQ not found'}), 404
    db.session.delete(faq)
    db.session.commit()
    return jsonify({'message': 'FAQ deleted successfully'}), 200

# --- UNANSWERED QUESTIONS ---
@admin_bp.route('/unanswered-questions', methods=['GET'])
@jwt_required()
def get_unanswered_questions():
    questions = UnansweredQuestion.query.order_by(UnansweredQuestion.frequency.desc()).all()
    return jsonify([q.to_dict() for q in questions]), 200

@admin_bp.route('/unanswered-questions/<int:qid>/convert-to-faq', methods=['POST'])
@jwt_required()
def convert_unanswered_to_faq(qid):
    uq = UnansweredQuestion.query.get(qid)
    if not uq:
        return jsonify({'error': 'Question not found'}), 404

    data = request.get_json() or {}
    answer = data.get('answer')
    if not answer:
        return jsonify({'error': 'Answer is required'}), 400

    faq = FAQKnowledge(
        category=data.get('category', 'general'),
        question=uq.question,
        answer=answer,
        keywords=data.get('keywords', ''),
        is_verified=True,
        is_published=True
    )
    db.session.add(faq)
    uq.status = 'resolved'
    db.session.commit()

    return jsonify({'message': 'Question converted to FAQ successfully', 'faq': faq.to_dict()}), 201

@admin_bp.route('/unanswered-questions/<int:qid>', methods=['DELETE'])
@jwt_required()
def delete_unanswered_question(qid):
    uq = UnansweredQuestion.query.get(qid)
    if not uq:
        return jsonify({'error': 'Question not found'}), 404
    db.session.delete(uq)
    db.session.commit()
    return jsonify({'message': 'Record removed'}), 200

# --- USER FEEDBACK & REPORTS ---
@admin_bp.route('/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
    items = Feedback.query.order_by(Feedback.id.desc()).all()
    return jsonify([i.to_dict() for i in items]), 200

@admin_bp.route('/feedback/<int:fid>/status', methods=['PATCH'])
@jwt_required()
def update_feedback_status(fid):
    item = Feedback.query.get(fid)
    if not item:
        return jsonify({'error': 'Feedback record not found'}), 404
    data = request.get_json() or {}
    status = data.get('status')
    if status:
        item.status = status
        db.session.commit()
    return jsonify(item.to_dict()), 200


# ===========================================================================
# EXTENDED ADMIN ROUTES FOR NEW FEATURES
# ===========================================================================
from app.models.notice import Notice
from app.models.faculty import Faculty
from app.models.event import Event
from app.models.academic import AcademicResource
from app.models.grievance import Grievance

# --- NOTICES ADMIN ---
@admin_bp.route('/notices', methods=['GET'])
@jwt_required()
def get_admin_notices():
    notices = Notice.query.order_by(Notice.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notices]), 200

@admin_bp.route('/notices', methods=['POST'])
@jwt_required()
def create_notice():
    data = request.get_json() or {}
    notice = Notice(
        title=data.get('title', ''), content=data.get('content', ''),
        category=data.get('category', 'general'), department=data.get('department', 'All Departments'),
        is_pinned=data.get('is_pinned', False), is_urgent=data.get('is_urgent', False),
        is_published=data.get('is_published', False), is_draft=data.get('is_draft', True),
        attachment_url=data.get('attachment_url'), source_url=data.get('source_url'),
    )
    if notice.is_published and not notice.published_at:
        from datetime import datetime
        notice.published_at = datetime.utcnow()
    db.session.add(notice); db.session.commit()
    return jsonify(notice.to_dict()), 201

@admin_bp.route('/notices/<int:notice_id>', methods=['PUT'])
@jwt_required()
def update_notice(notice_id):
    notice = Notice.query.get_or_404(notice_id)
    data = request.get_json() or {}
    for field in ['title','content','category','department','is_pinned','is_urgent','is_published','is_draft','attachment_url','source_url']:
        if field in data:
            setattr(notice, field, data[field])
    if data.get('is_published') and not notice.published_at:
        from datetime import datetime
        notice.published_at = datetime.utcnow()
    db.session.commit()
    return jsonify(notice.to_dict()), 200

@admin_bp.route('/notices/<int:notice_id>', methods=['DELETE'])
@jwt_required()
def delete_notice(notice_id):
    notice = Notice.query.get_or_404(notice_id)
    db.session.delete(notice); db.session.commit()
    return jsonify({'message': 'Notice deleted'}), 200

# --- FACULTY ADMIN ---
@admin_bp.route('/faculty', methods=['GET'])
@jwt_required()
def get_admin_faculty():
    faculty = Faculty.query.order_by(Faculty.department, Faculty.display_order).all()
    return jsonify([f.to_dict() for f in faculty]), 200

@admin_bp.route('/faculty', methods=['POST'])
@jwt_required()
def create_faculty():
    data = request.get_json() or {}
    if not data.get('name') or not data.get('department'):
        return jsonify({'error': 'name and department required'}), 400
    f = Faculty(
        name=data['name'], designation=data.get('designation','Assistant Professor'),
        department=data['department'], qualification=data.get('qualification'),
        specialization=data.get('specialization'), email=data.get('email'),
        phone=data.get('phone'), office_location=data.get('office_location'),
        photo_url=data.get('photo_url'), is_hod=data.get('is_hod', False),
        is_published=data.get('is_published', True), display_order=data.get('display_order', 99),
        joined_year=data.get('joined_year'),
    )
    db.session.add(f); db.session.commit()
    return jsonify(f.to_dict()), 201

@admin_bp.route('/faculty/<int:fid>', methods=['PUT'])
@jwt_required()
def update_faculty(fid):
    f = Faculty.query.get_or_404(fid)
    data = request.get_json() or {}
    for field in ['name','designation','department','qualification','specialization','email','phone','office_location','photo_url','is_hod','is_published','display_order','joined_year']:
        if field in data: setattr(f, field, data[field])
    db.session.commit()
    return jsonify(f.to_dict()), 200

@admin_bp.route('/faculty/<int:fid>', methods=['DELETE'])
@jwt_required()
def delete_faculty(fid):
    f = Faculty.query.get_or_404(fid)
    db.session.delete(f); db.session.commit()
    return jsonify({'message': 'Faculty deleted'}), 200

# --- EVENTS ADMIN ---
@admin_bp.route('/events', methods=['GET'])
@jwt_required()
def get_admin_events():
    events = Event.query.order_by(Event.event_date.desc()).all()
    return jsonify([e.to_dict() for e in events]), 200

@admin_bp.route('/events', methods=['POST'])
@jwt_required()
def create_event():
    data = request.get_json() or {}
    from datetime import datetime
    e = Event(
        title=data.get('title',''), category=data.get('category','general'),
        description=data.get('description'), venue=data.get('venue'),
        organizer=data.get('organizer'), registration_link=data.get('registration_link'),
        poster_url=data.get('poster_url'), status=data.get('status','upcoming'),
        is_featured=data.get('is_featured',False), is_published=data.get('is_published',False),
    )
    if data.get('event_date'):
        try: e.event_date = datetime.fromisoformat(data['event_date'])
        except: pass
    if data.get('end_date'):
        try: e.end_date = datetime.fromisoformat(data['end_date'])
        except: pass
    db.session.add(e); db.session.commit()
    return jsonify(e.to_dict()), 201

@admin_bp.route('/events/<int:eid>', methods=['PUT'])
@jwt_required()
def update_event(eid):
    e = Event.query.get_or_404(eid)
    data = request.get_json() or {}
    from datetime import datetime
    for field in ['title','category','description','venue','organizer','registration_link','poster_url','status','is_featured','is_published']:
        if field in data: setattr(e, field, data[field])
    if 'event_date' in data and data['event_date']:
        try: e.event_date = datetime.fromisoformat(data['event_date'])
        except: pass
    if 'end_date' in data and data['end_date']:
        try: e.end_date = datetime.fromisoformat(data['end_date'])
        except: pass
    db.session.commit()
    return jsonify(e.to_dict()), 200

@admin_bp.route('/events/<int:eid>', methods=['DELETE'])
@jwt_required()
def delete_event(eid):
    e = Event.query.get_or_404(eid)
    db.session.delete(e); db.session.commit()
    return jsonify({'message': 'Event deleted'}), 200

# --- ACADEMIC RESOURCES ADMIN ---
@admin_bp.route('/academic', methods=['GET'])
@jwt_required()
def get_admin_academic():
    resources = AcademicResource.query.order_by(AcademicResource.section, AcademicResource.display_order).all()
    return jsonify([r.to_dict() for r in resources]), 200

@admin_bp.route('/academic', methods=['POST'])
@jwt_required()
def create_academic():
    data = request.get_json() or {}
    r = AcademicResource(
        title=data.get('title',''), section=data.get('section','general'),
        description=data.get('description'), resource_type=data.get('resource_type','link'),
        file_url=data.get('file_url'), external_url=data.get('external_url'),
        is_external=data.get('is_external',False), is_published=data.get('is_published',True),
        display_order=data.get('display_order',99),
    )
    db.session.add(r); db.session.commit()
    return jsonify(r.to_dict()), 201

@admin_bp.route('/academic/<int:rid>', methods=['PUT'])
@jwt_required()
def update_academic(rid):
    r = AcademicResource.query.get_or_404(rid)
    data = request.get_json() or {}
    for field in ['title','section','description','resource_type','file_url','external_url','is_external','is_published','display_order']:
        if field in data: setattr(r, field, data[field])
    db.session.commit()
    return jsonify(r.to_dict()), 200

@admin_bp.route('/academic/<int:rid>', methods=['DELETE'])
@jwt_required()
def delete_academic(rid):
    r = AcademicResource.query.get_or_404(rid)
    db.session.delete(r); db.session.commit()
    return jsonify({'message': 'Resource deleted'}), 200

# --- GRIEVANCES ADMIN ---
@admin_bp.route('/grievances', methods=['GET'])
@jwt_required()
def get_admin_grievances():
    category = request.args.get('category')
    status = request.args.get('status')
    q = Grievance.query
    if category: q = q.filter_by(category=category)
    if status: q = q.filter_by(status=status)
    grievances = q.order_by(Grievance.created_at.desc()).all()
    return jsonify([g.to_dict(admin_view=True) for g in grievances]), 200

@admin_bp.route('/grievances/<int:gid>', methods=['PUT'])
@jwt_required()
def update_grievance(gid):
    g = Grievance.query.get_or_404(gid)
    data = request.get_json() or {}
    if 'status' in data: g.status = data['status']
    if 'admin_remarks' in data: g.admin_remarks = data['admin_remarks']
    if data.get('status') == 'resolved':
        from datetime import datetime
        g.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify(g.to_dict(admin_view=True)), 200

from datetime import datetime
from app.models import db

class CollegeInfo(db.Model):
    __tablename__ = 'college_info'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    short_name = db.Column(db.String(50), default='DLBCOE')
    tagline = db.Column(db.String(255))
    overview = db.Column(db.Text, nullable=False)
    vision = db.Column(db.Text)
    mission = db.Column(db.Text)
    history = db.Column(db.Text)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100), default='Visakhapatnam')
    state = db.Column(db.String(100), default='Andhra Pradesh')
    pincode = db.Column(db.String(20), default='530013')
    phone = db.Column(db.String(100))
    email = db.Column(db.String(100))
    website = db.Column(db.String(255))
    affiliation = db.Column(db.String(255))
    approval = db.Column(db.String(255))
    principal_name = db.Column(db.String(150))
    is_verified = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'short_name': self.short_name,
            'tagline': self.tagline,
            'overview': self.overview,
            'vision': self.vision,
            'mission': self.mission,
            'history': self.history,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'affiliation': self.affiliation,
            'approval': self.approval,
            'principal_name': self.principal_name,
            'is_verified': self.is_verified,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CampusBuilding(db.Model):
    __tablename__ = 'campus_buildings'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g. "Block 8", "Block 7"
    code = db.Column(db.String(50), unique=True, nullable=False) # "BLOCK_8", "BLOCK_7"
    description = db.Column(db.Text)
    total_floors = db.Column(db.Integer, default=4)
    location_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=True)
    is_verified = db.Column(db.Boolean, default=True)
    
    location = db.relationship('CampusLocation', backref='building_entity', foreign_keys=[location_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'total_floors': self.total_floors,
            'location_id': self.location_id,
            'location_slug': self.location.slug if self.location else None,
            'departments': [d.name for d in self.departments] if hasattr(self, 'departments') else [],
            'is_verified': self.is_verified
        }

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False) # CSE, ECE, EEE, CIVIL
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    head_of_department = db.Column(db.String(150))
    established_year = db.Column(db.Integer)
    student_intake = db.Column(db.Integer, default=60)
    building_id = db.Column(db.Integer, db.ForeignKey('campus_buildings.id'), nullable=True)
    floor = db.Column(db.String(50)) # "1st Floor", "2nd Floor", "3rd Floor"
    location_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=True)
    block_info = db.Column(db.String(100)) # "Block 8, 1st Floor"
    contact_email = db.Column(db.String(100))
    is_published = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=True)
    
    # Relationships
    building = db.relationship('CampusBuilding', backref='departments', foreign_keys=[building_id])
    courses = db.relationship('Course', backref='department', cascade='all, delete-orphan')
    labs = db.relationship('DepartmentLab', backref='department', cascade='all, delete-orphan')
    location = db.relationship('CampusLocation', backref='departments', foreign_keys=[location_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'head_of_department': self.head_of_department,
            'established_year': self.established_year,
            'student_intake': self.student_intake,
            'building_id': self.building_id,
            'building_name': self.building.name if self.building else (self.block_info.split(',')[0].strip() if self.block_info else None),
            'floor': self.floor,
            'location_id': self.location_id,
            'location_name': self.location.name if self.location else None,
            'location_slug': self.location.slug if self.location else None,
            'block_info': self.block_info,
            'contact_email': self.contact_email,
            'is_published': self.is_published,
            'is_verified': self.is_verified,
            'courses': [c.to_dict() for c in self.courses],
            'labs': [l.to_dict() for l in self.labs]
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    degree = db.Column(db.String(50), default='B.Tech')
    duration_years = db.Column(db.Integer, default=4)
    intake = db.Column(db.Integer, default=60)
    eligibility = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'name': self.name,
            'degree': self.degree,
            'duration_years': self.duration_years,
            'intake': self.intake,
            'eligibility': self.eligibility,
            'is_verified': self.is_verified
        }

class DepartmentLab(db.Model):
    __tablename__ = 'department_labs'
    
    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    key_equipment = db.Column(db.Text)
    floor = db.Column(db.String(50))
    location_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=True)
    is_verified = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'name': self.name,
            'description': self.description,
            'key_equipment': self.key_equipment,
            'floor': self.floor,
            'location_id': self.location_id,
            'is_verified': self.is_verified
        }

class Facility(db.Model):
    __tablename__ = 'facilities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50)) # academic, sports, dining, amenity, administrative
    description = db.Column(db.Text, nullable=False)
    operating_hours = db.Column(db.String(100))
    location_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=True)
    image_url = db.Column(db.String(255))
    floor_level = db.Column(db.String(100))
    is_published = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=True)
    
    location = db.relationship('CampusLocation', backref='facilities', foreign_keys=[location_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'operating_hours': self.operating_hours,
            'location_id': self.location_id,
            'location_name': self.location.name if self.location else None,
            'location_slug': self.location.slug if self.location else None,
            'floor_level': self.floor_level,
            'image_url': self.image_url,
            'is_published': self.is_published,
            'is_verified': self.is_verified
        }

class AdmissionInfo(db.Model):
    __tablename__ = 'admission_info'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(80), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    eligibility_criteria = db.Column(db.Text, nullable=False)
    admission_procedure = db.Column(db.Text)
    required_documents = db.Column(db.Text)
    fee_details = db.Column(db.Text)
    important_dates = db.Column(db.Text)
    scholarships_info = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'title': self.title,
            'description': self.description,
            'eligibility_criteria': self.eligibility_criteria,
            'admission_procedure': self.admission_procedure,
            'required_documents': self.required_documents,
            'fee_details': self.fee_details,
            'important_dates': self.important_dates,
            'scholarships_info': self.scholarships_info,
            'is_verified': self.is_verified
        }

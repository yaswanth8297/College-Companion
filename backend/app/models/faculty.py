from datetime import datetime
from app.models import db

class Faculty(db.Model):
    __tablename__ = 'faculty'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    designation = db.Column(db.String(100), default='Assistant Professor')
    department = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(255))
    specialization = db.Column(db.String(255))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    office_location = db.Column(db.String(100))
    photo_url = db.Column(db.String(255))
    is_hod = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=99)
    joined_year = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'designation': self.designation,
            'department': self.department, 'qualification': self.qualification,
            'specialization': self.specialization, 'email': self.email,
            'phone': self.phone, 'office_location': self.office_location,
            'photo_url': self.photo_url, 'is_hod': self.is_hod,
            'is_published': self.is_published, 'display_order': self.display_order,
            'joined_year': self.joined_year,
        }

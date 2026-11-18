import uuid
from datetime import datetime
from app.models import db

class Grievance(db.Model):
    __tablename__ = 'grievances'
    id = db.Column(db.Integer, primary_key=True)
    reference_number = db.Column(db.String(20), unique=True, nullable=False, default=lambda: 'GRV-' + uuid.uuid4().hex[:8].upper())
    student_name = db.Column(db.String(150), nullable=False)
    student_id = db.Column(db.String(50))
    department = db.Column(db.String(100))
    category = db.Column(db.String(80), default='general')  # academic, examination, department, facilities, infrastructure, general, other
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(255), nullable=True)
    contact_email = db.Column(db.String(100))
    status = db.Column(db.String(30), default='submitted')  # submitted, under_review, in_progress, resolved, closed
    admin_remarks = db.Column(db.Text, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, admin_view=False):
        data = {
            'id': self.id, 'reference_number': self.reference_number,
            'category': self.category, 'subject': self.subject,
            'department': self.department, 'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
        }
        if admin_view:
            data.update({
                'student_name': self.student_name, 'student_id': self.student_id,
                'description': self.description, 'attachment_url': self.attachment_url,
                'contact_email': self.contact_email, 'admin_remarks': self.admin_remarks,
            })
        return data

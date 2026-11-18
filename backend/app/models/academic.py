from datetime import datetime
from app.models import db

class AcademicResource(db.Model):
    __tablename__ = 'academic_resources'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    section = db.Column(db.String(80), default='general')  # examination, calendar, results, skill_development, regulations
    description = db.Column(db.Text)
    resource_type = db.Column(db.String(50), default='link')  # link, pdf, notice
    file_url = db.Column(db.String(255), nullable=True)
    external_url = db.Column(db.String(255), nullable=True)
    is_external = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=99)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'section': self.section,
            'description': self.description, 'resource_type': self.resource_type,
            'file_url': self.file_url, 'external_url': self.external_url,
            'is_external': self.is_external, 'is_published': self.is_published,
            'display_order': self.display_order,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

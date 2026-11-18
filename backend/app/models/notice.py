from datetime import datetime
from app.models import db

class Notice(db.Model):
    __tablename__ = 'notices'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), default='general')  # general, examination, academic, department, events, holiday, important
    department = db.Column(db.String(80), default='All Departments')
    is_pinned = db.Column(db.Boolean, default=False)
    is_urgent = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=False)
    is_draft = db.Column(db.Boolean, default=True)
    attachment_url = db.Column(db.String(255), nullable=True)
    source_url = db.Column(db.String(255), nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'content': self.content,
            'category': self.category, 'department': self.department,
            'is_pinned': self.is_pinned, 'is_urgent': self.is_urgent,
            'is_published': self.is_published, 'is_draft': self.is_draft,
            'attachment_url': self.attachment_url, 'source_url': self.source_url,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

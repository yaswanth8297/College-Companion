from datetime import datetime
from app.models import db

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(80), default='general')  # workshop, technical, hackathon, seminar, iic, sports, nss, ncc, student_activities
    description = db.Column(db.Text)
    venue = db.Column(db.String(150))
    organizer = db.Column(db.String(150))
    event_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime, nullable=True)
    registration_link = db.Column(db.String(255), nullable=True)
    poster_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), default='upcoming')  # upcoming, ongoing, completed
    is_featured = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'category': self.category,
            'description': self.description, 'venue': self.venue,
            'organizer': self.organizer,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'registration_link': self.registration_link, 'poster_url': self.poster_url,
            'status': self.status, 'is_featured': self.is_featured,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

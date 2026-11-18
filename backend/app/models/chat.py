from datetime import datetime
from app.models import db

class FAQKnowledge(db.Model):
    __tablename__ = 'faq_knowledge'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False) # general, academics, admissions, navigation, facilities, fees
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.String(255)) # comma-separated keywords for fast matching
    is_verified = db.Column(db.Boolean, default=True)
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'question': self.question,
            'answer': self.answer,
            'keywords': self.keywords,
            'is_verified': self.is_verified,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), index=True)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    intent = db.Column(db.String(50)) # navigation, college_info, academics, admissions, general
    navigation_data = db.Column(db.JSON, nullable=True) # stored route data if applicable
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'user_message': self.user_message,
            'bot_response': self.bot_response,
            'intent': self.intent,
            'navigation_data': self.navigation_data,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class UnansweredQuestion(db.Model):
    __tablename__ = 'unanswered_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    frequency = db.Column(db.Integer, default=1)
    status = db.Column(db.String(30), default='pending') # pending, resolved, dismissed
    last_asked = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'frequency': self.frequency,
            'status': self.status,
            'last_asked': self.last_asked.isoformat() if self.last_asked else None
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    feedback_type = db.Column(db.String(50), default='general') # general, navigation_correction, chatbot_quality, campus_data
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True) # 1 to 5
    contact_email = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(30), default='new') # new, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'feedback_type': self.feedback_type,
            'content': self.content,
            'rating': self.rating,
            'contact_email': self.contact_email,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

from datetime import datetime
from app.models import db

class CampusLocation(db.Model):
    __tablename__ = 'campus_locations'
    
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False) # gate, academic, admin, facility, lab, sports, parking, amenity
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    floor_level = db.Column(db.String(50), default='Ground Floor')
    block_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    accessibility_info = db.Column(db.String(255), default='Wheelchair accessible')
    is_navigable_destination = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'name': self.name,
            'category': self.category,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'floor_level': self.floor_level,
            'block_name': self.block_name,
            'description': self.description,
            'accessibility_info': self.accessibility_info,
            'is_navigable_destination': self.is_navigable_destination,
            'is_verified': self.is_verified
        }

class CampusPathway(db.Model):
    __tablename__ = 'campus_pathways'
    
    id = db.Column(db.Integer, primary_key=True)
    from_node_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=False)
    to_node_id = db.Column(db.Integer, db.ForeignKey('campus_locations.id'), nullable=False)
    distance_meters = db.Column(db.Float, nullable=False) # walking distance in meters
    pathway_type = db.Column(db.String(50), default='walkway') # walkway, corridor, ramp, stairs, road
    is_bidirectional = db.Column(db.Boolean, default=True)
    is_accessible = db.Column(db.Boolean, default=True) # wheelchair friendly
    instructions_forward = db.Column(db.String(255))
    instructions_reverse = db.Column(db.String(255))
    
    from_node = db.relationship('CampusLocation', foreign_keys=[from_node_id], backref='outgoing_pathways')
    to_node = db.relationship('CampusLocation', foreign_keys=[to_node_id], backref='incoming_pathways')
    
    def to_dict(self):
        return {
            'id': self.id,
            'from_node_id': self.from_node_id,
            'to_node_id': self.to_node_id,
            'from_node_name': self.from_node.name if self.from_node else None,
            'to_node_name': self.to_node.name if self.to_node else None,
            'distance_meters': self.distance_meters,
            'pathway_type': self.pathway_type,
            'is_bidirectional': self.is_bidirectional,
            'is_accessible': self.is_accessible,
            'instructions_forward': self.instructions_forward,
            'instructions_reverse': self.instructions_reverse
        }

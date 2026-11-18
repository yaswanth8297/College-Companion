from flask import Blueprint, request, jsonify
from app.models import db
from app.models.event import Event

event_bp = Blueprint('events', __name__, url_prefix='/api')


@event_bp.route('/events', methods=['GET'])
def get_events():
    category = request.args.get('category')
    status = request.args.get('status')
    q = request.args.get('q')

    query = Event.query.filter_by(is_published=True)

    if category:
        query = query.filter_by(category=category)
    if status:
        query = query.filter_by(status=status)
    if q:
        query = query.filter(
            (Event.title.ilike(f'%{q}%')) | (Event.description.ilike(f'%{q}%'))
        )

    events = query.order_by(Event.event_date).all()
    return jsonify([e.to_dict() for e in events]), 200


@event_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict()), 200

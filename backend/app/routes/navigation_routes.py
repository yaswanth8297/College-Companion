from flask import Blueprint, request, jsonify
from app.models.navigation import CampusLocation, CampusPathway
from app.navigation.routing import CampusNavigationEngine

nav_bp = Blueprint('navigation', __name__, url_prefix='/api')

@nav_bp.route('/locations', methods=['GET'])
def get_locations():
    category = request.args.get('category')
    destinations_only = request.args.get('destinations_only', 'false').lower() == 'true'
    
    query = CampusLocation.query
    if category:
        query = query.filter_by(category=category)
    if destinations_only:
        query = query.filter_by(is_navigable_destination=True)
        
    locations = query.order_by(CampusLocation.name).all()
    return jsonify([loc.to_dict() for loc in locations]), 200

@nav_bp.route('/locations/<int:loc_id>', methods=['GET'])
def get_location(loc_id):
    loc = CampusLocation.query.get(loc_id)
    if not loc:
        return jsonify({'error': 'Location not found'}), 404
    return jsonify(loc.to_dict()), 200

@nav_bp.route('/locations/search', methods=['GET'])
def search_locations():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([]), 200
        
    search_term = f"%{q}%"
    results = CampusLocation.query.filter(
        (CampusLocation.name.ilike(search_term)) |
        (CampusLocation.description.ilike(search_term)) |
        (CampusLocation.block_name.ilike(search_term)) |
        (CampusLocation.category.ilike(search_term))
    ).all()
    
    return jsonify([loc.to_dict() for loc in results]), 200

@nav_bp.route('/navigation/route', methods=['POST'])
def calculate_route():
    data = request.get_json() or {}
    origin_id = data.get('origin_id')
    destination_id = data.get('destination_id')
    wheelchair_only = data.get('wheelchair_only', False)

    # Support slug identifiers as well as IDs
    if isinstance(origin_id, str) and not origin_id.isdigit():
        orig_obj = CampusLocation.query.filter_by(slug=origin_id).first()
        origin_id = orig_obj.id if orig_obj else None

    if isinstance(destination_id, str) and not destination_id.isdigit():
        dest_obj = CampusLocation.query.filter_by(slug=destination_id).first()
        destination_id = dest_obj.id if dest_obj else None

    if not origin_id or not destination_id:
        return jsonify({'error': 'Both valid origin_id and destination_id are required'}), 400

    route_result = CampusNavigationEngine.find_shortest_path(int(origin_id), int(destination_id), wheelchair_only)
    if not route_result:
        return jsonify({
            'error': 'No navigable pathway found between these points with selected criteria',
            'possible_solution': 'Try disabling wheelchair-only mode or selecting a different entrance.'
        }), 404

    return jsonify(route_result), 200

@nav_bp.route('/navigation/pathways', methods=['GET'])
def get_pathways():
    """Returns all pathways to draw the entire campus path network if desired"""
    pathways = CampusPathway.query.all()
    return jsonify([p.to_dict() for p in pathways]), 200

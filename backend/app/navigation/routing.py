import math
import heapq
from app.models.navigation import CampusLocation, CampusPathway

def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula to calculate distance between two coordinates in meters"""
    R = 6371000 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def get_compass_bearing(lat1, lon1, lat2, lon2):
    """Calculate compass heading between two points"""
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    diff_long = math.radians(lon2 - lon1)

    x = math.sin(diff_long) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - (math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_long))
    initial_bearing = math.atan2(x, y)
    initial_bearing = math.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]
    idx = round(compass_bearing / 45) % 8
    return directions[idx]

class CampusNavigationEngine:
    @staticmethod
    def build_graph(wheelchair_only=False):
        """Constructs adjacency list graph from database nodes and edges"""
        locations = CampusLocation.query.all()
        loc_map = {loc.id: loc for loc in locations}
        
        pathways = CampusPathway.query.all()
        adj = {loc.id: [] for loc in locations}
        
        for p in pathways:
            if wheelchair_only and not p.is_accessible:
                continue
            
            # Forward edge
            adj[p.from_node_id].append({
                'to': p.to_node_id,
                'weight': p.distance_meters,
                'type': p.pathway_type,
                'instruction': p.instructions_forward,
                'accessible': p.is_accessible,
                'pathway_id': p.id
            })
            
            # Reverse edge if bidirectional
            if p.is_bidirectional:
                adj[p.to_node_id].append({
                    'to': p.from_node_id,
                    'weight': p.distance_meters,
                    'type': p.pathway_type,
                    'instruction': p.instructions_reverse or p.instructions_forward,
                    'accessible': p.is_accessible,
                    'pathway_id': p.id
                })
                
        return adj, loc_map

    @classmethod
    def resolve_physical_target_node(cls, location_id, loc_map):
        """Maps department/facility locations to physical building nodes if needed"""
        target_loc = loc_map.get(location_id)
        if not target_loc:
            return location_id, None
            
        slug = target_loc.slug
        if slug in ['cse', 'ece', 'eee', 'staff_room']:
            # Located in Block 8
            b8 = CampusLocation.query.filter_by(slug='block_8').first()
            if b8:
                return b8.id, target_loc
        elif slug in ['civil']:
            # Located in Block 7
            b7 = CampusLocation.query.filter_by(slug='block_7').first()
            if b7:
                return b7.id, target_loc
                
        return location_id, None

    @classmethod
    def find_shortest_path(cls, origin_id, destination_id, wheelchair_only=False):
        """
        Dijkstra's graph algorithm to find the optimal walking route
        along mapped campus pathways.
        """
        adj, loc_map = cls.build_graph(wheelchair_only)
        
        if origin_id not in loc_map or destination_id not in loc_map:
            return None

        actual_origin = loc_map[origin_id]
        actual_dest = loc_map[destination_id]

        # Resolve physical target building node
        graph_origin_id, specific_origin = cls.resolve_physical_target_node(origin_id, loc_map)
        graph_dest_id, specific_dest = cls.resolve_physical_target_node(destination_id, loc_map)

        if graph_origin_id == graph_dest_id:
            return {
                'origin': actual_origin.to_dict(),
                'destination': actual_dest.to_dict(),
                'total_distance_meters': 0,
                'estimated_minutes': 0,
                'path_nodes': [actual_dest.to_dict()],
                'coordinates': [[actual_dest.latitude, actual_dest.longitude]],
                'steps': [f"You are at {actual_origin.name}. Destination {actual_dest.name} is located at {actual_dest.block_name}, {actual_dest.floor_level}."],
                'detailed_steps': [{
                    'step': 1,
                    'instruction': f"Destination {actual_dest.name} is located in {actual_dest.block_name}, {actual_dest.floor_level}.",
                    'distance': 0,
                    'type': 'arrive',
                    'location_name': actual_dest.name
                }],
                'wheelchair_accessible': True
            }

        distances = {node: float('inf') for node in loc_map}
        distances[graph_origin_id] = 0
        previous_nodes = {}
        edge_used = {}
        
        pq = [(0, graph_origin_id)]

        while pq:
            current_dist, current_node = heapq.heappop(pq)

            if current_dist > distances[current_node]:
                continue

            if current_node == graph_dest_id:
                break

            for edge in adj.get(current_node, []):
                neighbor = edge['to']
                new_dist = current_dist + edge['weight']
                
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous_nodes[neighbor] = current_node
                    edge_used[neighbor] = edge
                    heapq.heappush(pq, (new_dist, neighbor))

        if distances[graph_dest_id] == float('inf'):
            return None

        # Reconstruct path
        path_ids = []
        curr = graph_dest_id
        while curr is not None:
            path_ids.append(curr)
            curr = previous_nodes.get(curr)
        path_ids.reverse()

        path_nodes = [loc_map[nid].to_dict() for nid in path_ids]
        coordinates = [[loc_map[nid].latitude, loc_map[nid].longitude] for nid in path_ids]
        
        total_dist = round(distances[graph_dest_id], 1)
        estimated_minutes = max(1, round(total_dist / 70.0))

        detailed_steps = []
        text_steps = []
        
        start_loc = actual_origin
        dest_loc = actual_dest
        
        text_steps.append(f"Start at {start_loc.name} ({start_loc.floor_level}).")
        detailed_steps.append({
            'step': 1,
            'instruction': f"Start from {start_loc.name} ({start_loc.floor_level}).",
            'distance': 0,
            'type': 'start',
            'location_name': start_loc.name
        })

        for i in range(len(path_ids) - 1):
            u = path_ids[i]
            v = path_ids[i + 1]
            u_loc = loc_map[u]
            v_loc = loc_map[v]
            edge = edge_used.get(v, {})
            dist = round(edge.get('weight', 0))
            custom_instruction = edge.get('instruction')
            
            heading = get_compass_bearing(u_loc.latitude, u_loc.longitude, v_loc.latitude, v_loc.longitude)
            
            if custom_instruction:
                step_text = f"{custom_instruction} ({dist}m)."
            else:
                step_text = f"Head {heading} towards {v_loc.name} along the {edge.get('type', 'pathway')} ({dist}m)."
                
            text_steps.append(step_text)
            detailed_steps.append({
                'step': i + 2,
                'instruction': step_text,
                'distance': dist,
                'type': edge.get('type', 'walkway'),
                'location_name': v_loc.name
            })

        # Final Arrival Step with exact confirmed building & floor details
        arrival_text = f"Arrive at {dest_loc.name} ({dest_loc.block_name}, {dest_loc.floor_level})."
        if specific_dest:
            arrival_text += f" Located in {dest_loc.block_name} on the {dest_loc.floor_level}."
        if dest_loc.accessibility_info:
            arrival_text += f" Accessibility: {dest_loc.accessibility_info}."
        text_steps.append(arrival_text)
        
        detailed_steps.append({
            'step': len(path_ids) + 1,
            'instruction': arrival_text,
            'distance': 0,
            'type': 'arrive',
            'location_name': dest_loc.name
        })

        return {
            'origin': actual_origin.to_dict(),
            'destination': actual_dest.to_dict(),
            'total_distance_meters': total_dist,
            'estimated_minutes': estimated_minutes,
            'path_nodes': path_nodes,
            'coordinates': coordinates,
            'steps': text_steps,
            'detailed_steps': detailed_steps,
            'wheelchair_accessible': all(edge_used.get(nid, {}).get('accessible', True) for nid in path_ids[1:])
        }

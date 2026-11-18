import re
from app.models.navigation import CampusLocation

class IntentDetector:
    NAVIGATION_PATTERNS = [
        r'(?:how\s+(?:do|can)\s+i\s+(?:reach|go|get|find)\s+(?:to\s+)?)(.+)',
        r'(?:where\s+is\s+(?:the\s+)?)(.+)',
        r'(?:directions?\s+(?:to|for)\s+(?:the\s+)?)(.+)',
        r'(?:route\s+(?:to|from)\s+(?:the\s+)?)(.+)',
        r'(?:take\s+me\s+to\s+(?:the\s+)?)(.+)',
        r'(?:navigate\s+to\s+(?:the\s+)?)(.+)',
        r'(?:shortest\s+walking\s+route\s+to\s+(?:the\s+)?)(.+)',
        r'(?:find\s+(?:the\s+)?)(.+)',
        r'(?:way\s+to\s+(?:the\s+)?)(.+)'
    ]
    
    GREETING_PATTERNS = [
        r'^(hi|hello|hey|namaste|good\s+morning|good\s+afternoon|good\s+evening)\b'
    ]

    @classmethod
    def is_greeting(cls, text):
        clean = text.strip().lower()
        for p in cls.GREETING_PATTERNS:
            if re.match(p, clean):
                return True
        return False

    @classmethod
    def extract_navigation_entities(cls, text):
        """
        Parses text to extract origin and destination.
        Examples:
        - 'How do I reach library from main gate?' -> origin='main gate', dest='library'
        - 'Where is the canteen?' -> origin=None, dest='canteen'
        - 'Route from administrative office to block a' -> origin='administrative office', dest='block a'
        """
        clean = text.lower().strip()
        
        # Check explicit "from X to Y" pattern
        from_to_match = re.search(r'from\s+([^,]+?)\s+(?:to|reach|find)\s+([^?.]+)', clean)
        if from_to_match:
            return from_to_match.group(1).strip(), from_to_match.group(2).strip()

        # Check explicit "to Y from X" pattern
        to_from_match = re.search(r'(?:to|reach)\s+([^,]+?)\s+from\s+([^?.]+)', clean)
        if to_from_match:
            return to_from_match.group(2).strip(), to_from_match.group(1).strip()

        # Check general navigation regex
        for pattern in cls.NAVIGATION_PATTERNS:
            m = re.search(pattern, clean)
            if m:
                target = m.group(1).strip().rstrip('?.!')
                # Check if target contains "from"
                if ' from ' in target:
                    parts = target.split(' from ')
                    return parts[1].strip(), parts[0].strip()
                return None, target

        # Check if known locations are mentioned
        locations = CampusLocation.query.all()
        found_locs = []
        for loc in locations:
            # Check slug or name words
            name_lower = loc.name.lower()
            if name_lower in clean or loc.slug.replace('_', ' ') in clean:
                found_locs.append(loc)
                
        if len(found_locs) >= 2:
            return found_locs[0].name, found_locs[1].name
        elif len(found_locs) == 1:
            # If word contains direction keywords
            if any(k in clean for k in ['go', 'reach', 'find', 'locate', 'directions', 'walk', 'distance', 'where']):
                return None, found_locs[0].name

        return None, None

    @classmethod
    def resolve_location(cls, query_text):
        """Matches a string to the closest CampusLocation entity"""
        if not query_text:
            return None

        clean = query_text.lower().strip()
        # Remove common filler words
        for w in ['the', 'college', 'building', 'campus', 'block', 'room', 'office', 'center', 'centre']:
            clean_sub = re.sub(rf'\b{w}\b', '', clean).strip()

        locations = CampusLocation.query.all()
        
        # 1. Exact match on slug
        for loc in locations:
            if loc.slug.lower() == clean.replace(' ', '_'):
                return loc

        # 2. Exact match on name
        for loc in locations:
            if loc.name.lower() == clean:
                return loc

        # 3. Substring match on name
        for loc in locations:
            if clean in loc.name.lower() or loc.name.lower() in clean:
                return loc

        # 4. Keyword token match
        tokens = set(re.findall(r'\w+', clean))
        best_match = None
        best_score = 0
        for loc in locations:
            loc_tokens = set(re.findall(r'\w+', loc.name.lower()))
            overlap = len(tokens.intersection(loc_tokens))
            if overlap > best_score:
                best_score = overlap
                best_match = loc

        if best_score > 0:
            return best_match

        return None

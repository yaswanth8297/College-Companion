import os
import re
from app.models import db
from app.models.college import CollegeInfo, Department, Facility, AdmissionInfo
from app.models.navigation import CampusLocation
from app.models.chat import FAQKnowledge, UnansweredQuestion, ChatHistory
from app.navigation.routing import CampusNavigationEngine
from app.chatbot.intent_detector import IntentDetector

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class CollegeChatbotEngine:
    @classmethod
    def get_context_corpus(cls):
        """Gathers college knowledge for indexing / retrieval"""
        college = CollegeInfo.query.first()
        departments = Department.query.filter_by(is_published=True).all()
        facilities = Facility.query.filter_by(is_published=True).all()
        admissions = AdmissionInfo.query.all()
        faqs = FAQKnowledge.query.filter_by(is_published=True).all()
        locations = CampusLocation.query.all()
        
        corpus = []
        
        if college:
            corpus.append({
                'category': 'overview',
                'title': f"{college.name} Overview & History",
                'content': f"{college.name} ({college.short_name}): {college.overview} Located at {college.address}, {college.city}, {college.state} - {college.pincode}. Affiliated to {college.affiliation}, approved by {college.approval}. Vision: {college.vision}. Mission: {college.mission}.",
                'keywords': ['about', 'college', 'history', 'overview', 'address', 'location', 'vision', 'mission', 'principal', 'affiliation', 'bullayya', 'dlbcoe']
            })
            
        for dept in departments:
            courses_str = ", ".join([f"{c.degree} in {c.name} (Intake: {c.intake})" for c in dept.courses])
            labs_str = ", ".join([l.name for l in dept.labs])
            corpus.append({
                'category': 'department',
                'title': f"Department of {dept.name} ({dept.code})",
                'content': f"Department of {dept.name} ({dept.code}): {dept.description}. Head of Department: {dept.head_of_department or 'Information to be confirmed'}. Established in {dept.established_year}. Location: {dept.block_info or 'Engineering Block'}. Offered Courses: {courses_str or 'B.Tech'}. Laboratories: {labs_str or 'Departmental Labs'}.",
                'keywords': [dept.code.lower(), dept.name.lower(), 'department', 'hod', 'head', 'faculty', 'labs', 'engineering']
            })
            
        for fac in facilities:
            corpus.append({
                'category': 'facility',
                'title': f"Campus Facility: {fac.name}",
                'content': f"{fac.name} ({fac.category}): {fac.description}. Operating Hours: {fac.operating_hours or 'Regular college hours'}. Location: {fac.location.name if fac.location else 'Campus grounds'}.",
                'keywords': [fac.name.lower(), fac.category.lower(), 'facility', 'timings', 'hours', 'open']
            })
            
        for adm in admissions:
            corpus.append({
                'category': 'admissions',
                'title': f"Admissions: {adm.title}",
                'content': f"{adm.title} ({adm.category}): {adm.description}. Eligibility: {adm.eligibility_criteria}. Procedure: {adm.admission_procedure or 'Through EAPCET / Convenor Quota'}. Documents Required: {adm.required_documents or 'Standard educational certificates'}. Scholarships: {adm.scholarships_info or 'Government and merit scholarships applicable'}. Fee Details: {adm.fee_details or 'As per state fee regulatory committee'}.",
                'keywords': ['admission', 'admissions', 'apply', 'eligibility', 'documents', 'btech', 'lateral', 'eapcet', 'fee', 'fees', 'scholarship', adm.category.lower()]
            })
            
        for faq in faqs:
            kw = [k.strip().lower() for k in faq.keywords.split(',')] if faq.keywords else []
            corpus.append({
                'category': faq.category,
                'title': faq.question,
                'content': f"Q: {faq.question}\nA: {faq.answer}",
                'keywords': kw + re.findall(r'\w+', faq.question.lower())
            })
            
        for loc in locations:
            corpus.append({
                'category': 'location',
                'title': f"Campus Location: {loc.name}",
                'content': f"{loc.name}: {loc.description or 'Campus building/facility'}. Category: {loc.category}. Block: {loc.block_name}. Floor: {loc.floor_level}. Accessibility: {loc.accessibility_info}.",
                'keywords': [loc.name.lower(), loc.slug.lower(), 'location', 'block', 'floor', 'wheelchair']
            })

        return corpus

    @classmethod
    def find_relevant_context(cls, user_query, corpus, top_k=3):
        """Rule & keyword based semantic retrieval from the corpus"""
        query_words = set(re.findall(r'\w+', user_query.lower()))
        # Remove low-value words
        stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'and', 'or', 'to', 'for', 'of', 'what', 'who', 'how', 'can', 'you', 'tell', 'me', 'please'}
        query_terms = query_words - stop_words

        if not query_terms:
            return []

        scored_items = []
        for item in corpus:
            score = 0
            content_lower = item['content'].lower()
            title_lower = item['title'].lower()
            
            # Check title matches (high weight)
            for term in query_terms:
                if term in title_lower:
                    score += 5
                if term in item.get('keywords', []):
                    score += 3
                if term in content_lower:
                    score += 1
                    
            if score > 0:
                scored_items.append((score, item))

        scored_items.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored_items[:top_k]]

    @classmethod
    def get_last_bot_question(cls, session_id):
        """Retrieves last conversation entry to handle follow-up affirmations"""
        if not session_id:
            return None
        last_chat = ChatHistory.query.filter_by(session_id=session_id).order_by(ChatHistory.id.desc()).first()
        return last_chat

    @classmethod
    def process_chat(cls, user_message, session_id=None, gemini_api_key=None):
        """
        Main orchestration endpoint:
        1. Checks for affirmative follow-ups ('yes', 'sure', 'ok') to navigation prompts
        2. Detects navigation requests
        3. Falls back to RAG / knowledge retrieval
        4. Calls Gemini if API key configured, otherwise high-precision rule-based knowledge engine
        """
        clean_msg = user_message.strip()
        clean_lower = clean_msg.lower()
        
        # 1. Check affirmative follow-ups ("yes", "yeah", "sure", "please navigate")
        last_chat = cls.get_last_bot_question(session_id)
        if last_chat and any(clean_lower == aff or clean_lower.startswith(aff + " ") for aff in ['yes', 'yeah', 'sure', 'yep', 'ok', 'okay', 'please', 'show me']):
            # Check if previous response offered navigation from Main Gate
            if "would you like directions from the main gate" in last_chat.bot_response.lower() or "would you like directions" in last_chat.bot_response.lower():
                # Extract previous target destination
                prev_loc_match = re.search(r'([A-Za-z0-9\s]+?)\s+is (?:located|available) on the campus', last_chat.bot_response)
                if prev_loc_match:
                    dest_str = prev_loc_match.group(1).strip()
                    dest_loc = IntentDetector.resolve_location(dest_str)
                    main_gate = CampusLocation.query.filter_by(slug='main_gate').first()
                    if dest_loc and main_gate:
                        route = CampusNavigationEngine.find_shortest_path(main_gate.id, dest_loc.id)
                        if route:
                            steps_str = "\n".join([f"{i+1}. {s['instruction']}" for i, s in enumerate(route['detailed_steps'])])
                            response_text = (
                                f"Here are the walking directions from {main_gate.name} to {dest_loc.name} "
                                f"({route['total_distance_meters']} meters, approximately {route['estimated_minutes']} min walk):\n\n"
                                f"{steps_str}\n\n"
                                f"Click below to see the interactive route highlighted on the campus map."
                            )
                            return {
                                'response': response_text,
                                'intent': 'navigation',
                                'navigation_route': route,
                                'suggested_questions': [
                                    "Where is the college canteen?",
                                    "What are the library timings?",
                                    "Tell me about CSE department"
                                ]
                            }

        # 2. Check greetings
        if IntentDetector.is_greeting(clean_msg):
            return {
                'response': "Namaste! I am Ratna, your AI College Companion for Dr. Lankapalli Bullayya College of Engineering. How can I assist you today? You can ask me for walking directions to any campus block, department details, facilities, or admissions.",
                'intent': 'greeting',
                'navigation_route': None,
                'suggested_questions': [
                    "How do I reach the library from the main gate?",
                    "Where is the Computer Science block?",
                    "What are the admission requirements for B.Tech?",
                    "Where is the college canteen?"
                ]
            }

        # 3. Check navigation intent
        origin_str, dest_str = IntentDetector.extract_navigation_entities(clean_msg)
        
        # If destination was found
        if dest_str:
            dest_loc = IntentDetector.resolve_location(dest_str)
            if dest_loc:
                # If origin was specified
                if origin_str:
                    origin_loc = IntentDetector.resolve_location(origin_str)
                    if not origin_loc:
                        # Ambiguous origin
                        return {
                            'response': f"I found the destination **{dest_loc.name}**, but I couldn't locate '{origin_str}'. Are you starting from the Main Gate, Administrative Block, or somewhere else?",
                            'intent': 'navigation_clarification',
                            'navigation_route': None,
                            'suggested_questions': [
                                f"Directions from Main Gate to {dest_loc.name}",
                                f"Directions from Admin Block to {dest_loc.name}"
                            ]
                        }
                    # Calculate route
                    route = CampusNavigationEngine.find_shortest_path(origin_loc.id, dest_loc.id)
                    if route:
                        steps_str = "\n".join([f"{i+1}. {s['instruction']}" for i, s in enumerate(route['detailed_steps'])])
                        response_text = (
                            f"Walking directions from **{origin_loc.name}** to **{dest_loc.name}** "
                            f"({route['total_distance_meters']} meters, ~{route['estimated_minutes']} min walk):\n\n"
                            f"{steps_str}\n\n"
                            f"Click the button below to view the active path on the interactive campus map."
                        )
                        return {
                            'response': response_text,
                            'intent': 'navigation',
                            'navigation_route': route,
                            'suggested_questions': [
                                "Where is the canteen?",
                                "Show me sports facilities",
                                "Find Principal's Office"
                            ]
                        }
                    else:
                        return {
                            'response': f"I located both {origin_loc.name} and {dest_loc.name}, but there is currently no mapped pathway connecting them in the database. Please contact campus security for assistance.",
                            'intent': 'navigation_error',
                            'navigation_route': None
                        }
                else:
                    # Destination known, but starting location not specified!
                    if dest_loc.slug == 'cse':
                        exact_text = "CSE is located in Block 8, 1st Floor."
                    elif dest_loc.slug == 'ece':
                        exact_text = "ECE is located in Block 8, 2nd Floor."
                    elif dest_loc.slug == 'eee':
                        exact_text = "EEE is located in Block 8, 3rd Floor."
                    elif dest_loc.slug == 'civil':
                        exact_text = "Civil Engineering is located in Block 7, 3rd Floor."
                    elif dest_loc.slug == 'staff_room':
                        exact_text = "The Staff Room is located in Block 8, 1st Floor, beside the lift."
                    else:
                        exact_text = f"{dest_loc.name} is located at {dest_loc.block_name}, {dest_loc.floor_level}."

                    response_text = (
                        f"{exact_text}\n\n"
                        f"Would you like walking directions from the Main Gate or from another location?"
                    )
                    return {
                        'response': response_text,
                        'intent': 'navigation_prompt_origin',
                        'destination_id': dest_loc.id,
                        'destination_name': dest_loc.name,
                        'destination_slug': dest_loc.slug,
                        'suggested_questions': [
                            f"How do I reach {dest_loc.name} from the main gate?",
                            f"Directions from Admin Block to {dest_loc.name}",
                            "Where is the Main Gate?"
                        ]
                    }

        # 4. Knowledge Base RAG Search
        corpus = cls.get_context_corpus()
        relevant_docs = cls.find_relevant_context(clean_msg, corpus, top_k=3)
        
        # Check if Gemini API key is available
        api_key = gemini_api_key or os.environ.get('GEMINI_API_KEY')
        if api_key and GENAI_AVAILABLE and relevant_docs:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                context_text = "\n\n".join([f"Source: {doc['title']}\n{doc['content']}" for doc in relevant_docs])
                
                prompt = f"""You are Ratna, the official AI College Companion for Dr. Lankapalli Bullayya College of Engineering (Visakhapatnam, Andhra Pradesh).
Answer the user's question using ONLY the provided verified context.
Strict Rules:
- Answer accurately, politely, and concisely as Ratna.
- Do NOT hallucinate fees, phone numbers, admission dates, faculty names, or building locations.
- If the information is not present in the context, respond strictly:
"I don't have verified information about this yet. Please contact the college administration for confirmation."

Verified College Context:
{context_text}

User Question: {clean_msg}
Assistant Answer:"""
                
                ai_resp = model.generate_content(prompt)
                if ai_resp and ai_resp.text:
                    return {
                        'response': ai_resp.text.strip(),
                        'intent': 'college_info',
                        'navigation_route': None,
                        'suggested_questions': [
                            "Tell me about engineering departments",
                            "What are the admission procedures?",
                            "How do I reach the library from the main gate?"
                        ]
                    }
            except Exception as e:
                # Log error and fall through to built-in knowledge engine
                print(f"Gemini API error, using built-in rule knowledge engine: {e}")

        # 5. Fallback rule-based verified knowledge synthesizer
        if relevant_docs:
            top_doc = relevant_docs[0]
            # Construct clear, verified answer from top matched knowledge
            ans_content = top_doc['content']
            if top_doc['category'] == 'department':
                resp = f"**{top_doc['title']}**\n\n{ans_content}\n\nWould you like directions to this department's block on the campus map?"
            elif top_doc['category'] == 'facility':
                resp = f"**{top_doc['title']}**\n\n{ans_content}\n\nWould you like walking directions to this facility?"
            elif top_doc['category'] == 'admissions':
                resp = f"**{top_doc['title']}**\n\n{ans_content}\n\n*Note: Fee structures and dates are subject to state regulatory notification. For the latest updates, please consult the college admissions desk.*"
            else:
                resp = f"{ans_content}"
                
            return {
                'response': resp,
                'intent': top_doc['category'],
                'navigation_route': None,
                'suggested_questions': [
                    "Explore college facilities",
                    "How to reach the library from the main gate?",
                    "What courses are offered?"
                ]
            }

        # 6. Unanswered Question Handling
        # Record question in unanswered questions table for administration review
        unanswered = UnansweredQuestion.query.filter_by(question=clean_msg).first()
        if unanswered:
            unanswered.frequency += 1
        else:
            db.session.add(UnansweredQuestion(question=clean_msg))
        db.session.commit()

        return {
            'response': "I don't have verified information about this yet. Please contact the college administration for confirmation.",
            'intent': 'unknown',
            'navigation_route': None,
            'suggested_questions': [
                "How do I reach the library from the main gate?",
                "What courses are offered at DLBCOE?",
                "Where is the administrative office?",
                "Tell me about campus facilities"
            ]
        }

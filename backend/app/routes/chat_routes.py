import uuid
from flask import Blueprint, request, jsonify
from app.models import db
from app.models.chat import ChatHistory, Feedback, FAQKnowledge
from app.chatbot.rag_engine import CollegeChatbotEngine

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

@chat_bp.route('', methods=['POST'])
def send_chat_message():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    session_id = data.get('session_id') or str(uuid.uuid4())

    if not message:
        return jsonify({'error': 'Message content cannot be empty'}), 400

    # Process message through AI / RAG / Navigation orchestrator
    result = CollegeChatbotEngine.process_chat(message, session_id=session_id)

    # Persist chat history
    history = ChatHistory(
        session_id=session_id,
        user_message=message,
        bot_response=result['response'],
        intent=result.get('intent'),
        navigation_data=result.get('navigation_route')
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({
        'session_id': session_id,
        'response': result['response'],
        'intent': result.get('intent'),
        'navigation_route': result.get('navigation_route'),
        'suggested_questions': result.get('suggested_questions', []),
        'destination_id': result.get('destination_id')
    }), 200

@chat_bp.route('/history', methods=['GET'])
def get_chat_history():
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({'error': 'session_id parameter is required'}), 400

    chats = ChatHistory.query.filter_by(session_id=session_id).order_by(ChatHistory.timestamp.asc()).all()
    return jsonify([c.to_dict() for c in chats]), 200

@chat_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}
    content = data.get('content', '').strip()
    feedback_type = data.get('feedback_type', 'general')
    rating = data.get('rating')
    email = data.get('email')

    if not content:
        return jsonify({'error': 'Feedback content cannot be empty'}), 400

    fb = Feedback(
        content=content,
        feedback_type=feedback_type,
        rating=int(rating) if rating is not None else None,
        contact_email=email
    )
    db.session.add(fb)
    db.session.commit()

    return jsonify({'message': 'Thank you! Your feedback has been received.', 'id': fb.id}), 201

@chat_bp.route('/suggestions', methods=['GET'])
def get_suggested_questions():
    faqs = FAQKnowledge.query.filter_by(is_published=True).limit(6).all()
    suggestions = [f.question for f in faqs]
    if not suggestions:
        suggestions = [
            "How do I reach the library from the main gate?",
            "Where is the college canteen?",
            "What courses are offered in Computer Science?",
            "What is the eligibility for B.Tech admission?",
            "Where can I find the Principal's office?",
            "Are there hostel and transport facilities?"
        ]
    return jsonify(suggestions), 200

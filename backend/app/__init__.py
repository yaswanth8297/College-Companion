import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure uploads folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Ensure database folder exists
    db_path = app.config.get('DATABASE_PATH')
    if db_path:
        os.makedirs(os.path.dirname(db_path), exist_ok=True)

    # Serve static uploads
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.college_routes import college_bp
    from app.routes.navigation_routes import nav_bp
    from app.routes.chat_routes import chat_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(college_bp)
    app.register_blueprint(nav_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)

    from app.routes.notice_routes import notice_bp
    from app.routes.faculty_routes import faculty_bp
    from app.routes.event_routes import event_bp
    from app.routes.academic_routes import academic_bp
    from app.routes.grievance_routes import grievance_bp
    app.register_blueprint(notice_bp)
    app.register_blueprint(faculty_bp)
    app.register_blueprint(event_bp)
    app.register_blueprint(academic_bp)
    app.register_blueprint(grievance_bp)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'College Companion API',
            'institution': 'Dr. Lankapalli Bullayya College of Engineering'
        }), 200

    # Initialize tables and seed verified data within context
    with app.app_context():
        db.create_all()
        from app.services.seed_data import seed_database
        try:
            seed_database()
        except Exception as e:
            print(f"Error seeding database: {e}")

    return app

import os
import shutil
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

is_vercel = bool(os.environ.get('VERCEL'))

# Database resolution & postgres dialect fix
db_url = os.environ.get('DATABASE_URL')
if db_url and db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

default_db_dir = os.path.abspath(os.path.join(basedir, '..', 'database'))
default_db_path = os.path.join(default_db_dir, 'college.db')

if is_vercel:
    target_db_path = '/tmp/college.db'
    if os.path.exists(default_db_path) and not os.path.exists(target_db_path):
        try:
            shutil.copy2(default_db_path, target_db_path)
        except Exception as e:
            print(f"Warning: could not copy pre-seeded database to /tmp: {e}")
    DATABASE_PATH = target_db_path
    db_uri = db_url or f"sqlite:///{target_db_path}"
    upload_folder = '/tmp/uploads'
else:
    DATABASE_PATH = default_db_path
    db_uri = db_url or f"sqlite:///{default_db_path}"
    upload_folder = os.path.join(basedir, 'uploads')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dlbcoe-companion-secret-key-2026'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dlbcoe-jwt-super-secret-key-2026'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    DATABASE_PATH = DATABASE_PATH
    SQLALCHEMY_DATABASE_URI = db_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or ''
    
    # File uploads
    UPLOAD_FOLDER = upload_folder
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max

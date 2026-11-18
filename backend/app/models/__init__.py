from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Ensure all models are registered with SQLAlchemy metadata
from app.models.college import (
    CollegeInfo, CampusBuilding, Department, Course, DepartmentLab, Facility, AdmissionInfo
)
from app.models.navigation import CampusLocation, CampusPathway
from app.models.user import AdminUser
from app.models.chat import FAQKnowledge, ChatHistory, UnansweredQuestion, Feedback
from app.models.notice import Notice
from app.models.faculty import Faculty
from app.models.event import Event
from app.models.academic import AcademicResource
from app.models.grievance import Grievance

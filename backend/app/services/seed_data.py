from app.models import db
from app.models.user import AdminUser
from app.models.college import CollegeInfo, CampusBuilding, Department, Course, DepartmentLab, Facility, AdmissionInfo
from app.models.navigation import CampusLocation, CampusPathway
from app.models.chat import FAQKnowledge

def seed_database():
    """Populates database with verified Dr. Lankapalli Bullayya College of Engineering data"""
    
    # 1. Admin User
    if not AdminUser.query.filter_by(username='admin').first():
        admin = AdminUser(
            username='admin',
            full_name='Campus Administrator',
            role='superadmin'
        )
        admin.set_password('adminpassword123')
        db.session.add(admin)

    # 2. College Info
    college = CollegeInfo.query.first()
    if not college:
        college = CollegeInfo(
            name="Dr. Lankapalli Bullayya College of Engineering",
            short_name="DLBCOE",
            tagline="Empowering Minds, Engineering the Future",
            overview=(
                "Dr. Lankapalli Bullayya College of Engineering is a premier technical institution "
                "established in Visakhapatnam under the aegis of 'The Society for Collegiate Education'. "
                "Located on an expansive campus in the heart of Visakhapatnam city at New Resapuvanipalem, "
                "the college provides quality technical education, well-equipped laboratories, "
                "experienced faculty, and active industry collaboration."
            ),
            vision=(
                "To emerge as a center of excellence in technical education and research, "
                "fostering innovative, socially responsible engineers capable of meeting global challenges."
            ),
            mission=(
                "To impart quality education through student-centric pedagogical approaches, state-of-the-art "
                "laboratories, research initiatives, and strong partnerships with industries and academic institutions."
            ),
            history=(
                "Established by The Society for Collegiate Education, founded in honor of Dr. Lankapalli Bullayya, "
                "illustrious former Vice-Chancellor of Andhra University. Over decades, the campus has evolved into "
                "one of North Coastal Andhra Pradesh's most respected educational hubs."
            ),
            address="New Resapuvanipalem, Opp. Swarna Bharathi Indoor Stadium",
            city="Visakhapatnam",
            state="Andhra Pradesh",
            pincode="530013",
            phone="+91 891 2701819",
            email="info@bullayyacollege.info",
            website="https://www.bullayyacollege.info",
            affiliation="Affiliated to Andhra University / JNTU-GV",
            approval="Approved by AICTE, New Delhi",
            principal_name="Dr. G. Deepak",
            is_verified=True
        )
        db.session.add(college)

    # 3. Clean up any obsolete/fabricated locations from previous seeds
    obsolete_slugs = ['block_a', 'block_b', 'block_c', 'academic_plaza', 'parking_four_wheeler']
    for obs in obsolete_slugs:
        old_loc = CampusLocation.query.filter_by(slug=obs).first()
        if old_loc:
            CampusPathway.query.filter((CampusPathway.from_node_id == old_loc.id) | (CampusPathway.to_node_id == old_loc.id)).delete()
            db.session.delete(old_loc)
    db.session.flush()

    # 4. Verified Campus Locations (Nodes)
    locations_data = [
        {
            'slug': 'main_gate',
            'name': 'Main Entrance Gate',
            'category': 'gate',
            'latitude': 17.73080,
            'longitude': 83.31520,
            'floor_level': 'Ground Level',
            'block_name': 'Campus Entrance',
            'description': 'Main college entrance gate on New Resapuvanipalem Road with 24/7 security booth and visitor reception.',
            'accessibility_info': 'Fully wheelchair accessible level entrance',
            'is_navigable_destination': True
        },
        {
            'slug': 'admin_block',
            'name': 'Administrative Office & Principal Block',
            'category': 'admin',
            'latitude': 17.73120,
            'longitude': 83.31535,
            'floor_level': 'Ground & 1st Floor',
            'block_name': 'Administrative Block',
            'description': 'Houses Principal Chamber, Administrative Office, Admissions Desk, Accounts Section, and Examination Cell.',
            'accessibility_info': 'Ground floor accessible via ramp; elevator access to upper floor',
            'is_navigable_destination': True
        },
        {
            'slug': 'block_8',
            'name': 'Block 8',
            'category': 'academic',
            'latitude': 17.73190,
            'longitude': 83.31550,
            'floor_level': 'Multi-Storey (Floors 1, 2, 3)',
            'block_name': 'Block 8',
            'description': 'Physical engineering building housing CSE (1st Floor), ECE (2nd Floor), EEE (3rd Floor), and Staff Room (1st Floor, beside the lift).',
            'accessibility_info': 'Ramp at main entrance, wide elevator to all floors',
            'is_navigable_destination': True
        },
        {
            'slug': 'block_7',
            'name': 'Block 7',
            'category': 'academic',
            'latitude': 17.73140,
            'longitude': 83.31610,
            'floor_level': 'Multi-Storey (Floor 3)',
            'block_name': 'Block 7',
            'description': 'Physical engineering building housing Civil Engineering on the 3rd Floor.',
            'accessibility_info': 'Wheelchair accessible ground entrance, lift access to 3rd floor',
            'is_navigable_destination': True
        },
        {
            'slug': 'cse',
            'name': 'Computer Science and Engineering (CSE)',
            'category': 'academic',
            'latitude': 17.73190,
            'longitude': 83.31550,
            'floor_level': '1st Floor',
            'block_name': 'Block 8',
            'description': 'Department of Computer Science and Engineering. Located in Block 8, 1st Floor.',
            'accessibility_info': 'Elevator and stairs in Block 8',
            'is_navigable_destination': True
        },
        {
            'slug': 'ece',
            'name': 'Electronics and Communication Engineering (ECE)',
            'category': 'academic',
            'latitude': 17.73190,
            'longitude': 83.31550,
            'floor_level': '2nd Floor',
            'block_name': 'Block 8',
            'description': 'Department of Electronics and Communication Engineering. Located in Block 8, 2nd Floor.',
            'accessibility_info': 'Elevator and stairs in Block 8',
            'is_navigable_destination': True
        },
        {
            'slug': 'eee',
            'name': 'Electrical and Electronics Engineering (EEE)',
            'category': 'academic',
            'latitude': 17.73190,
            'longitude': 83.31550,
            'floor_level': '3rd Floor',
            'block_name': 'Block 8',
            'description': 'Department of Electrical and Electronics Engineering. Located in Block 8, 3rd Floor.',
            'accessibility_info': 'Elevator and stairs in Block 8',
            'is_navigable_destination': True
        },
        {
            'slug': 'civil',
            'name': 'Civil Engineering',
            'category': 'academic',
            'latitude': 17.73140,
            'longitude': 83.31610,
            'floor_level': '3rd Floor',
            'block_name': 'Block 7',
            'description': 'Department of Civil Engineering. Located in Block 7, 3rd Floor.',
            'accessibility_info': 'Elevator and stairs in Block 7',
            'is_navigable_destination': True
        },
        {
            'slug': 'staff_room',
            'name': 'Staff Room',
            'category': 'facility',
            'latitude': 17.73190,
            'longitude': 83.31550,
            'floor_level': '1st Floor, beside the lift',
            'block_name': 'Block 8',
            'description': 'Engineering faculty staff room located in Block 8, 1st Floor, directly beside the lift.',
            'accessibility_info': 'Accessible via Block 8 lift on 1st Floor',
            'is_navigable_destination': True
        },
        {
            'slug': 'library',
            'name': 'Central Library',
            'category': 'facility',
            'latitude': 17.73160,
            'longitude': 83.31510,
            'floor_level': 'Ground & 1st Floor',
            'block_name': 'Library Building',
            'description': 'Dr. Lankapalli Bullayya Central Library with textbook reference halls, digital library section, and reading lounges.',
            'accessibility_info': 'Step-free gentle ramp entrance',
            'is_navigable_destination': True
        },
        {
            'slug': 'canteen',
            'name': 'College Canteen',
            'category': 'facility',
            'latitude': 17.73220,
            'longitude': 83.31570,
            'floor_level': 'Ground Floor',
            'block_name': 'Canteen Complex',
            'description': 'Campus cafeteria serving breakfast, subsidized lunch meals, fresh juices, and refreshments.',
            'accessibility_info': 'Ground level step-free entrance',
            'is_navigable_destination': True
        },
        {
            'slug': 'workshop',
            'name': 'Laboratories & Workshop',
            'category': 'lab',
            'latitude': 17.73115,
            'longitude': 83.31640,
            'floor_level': 'Ground Floor',
            'block_name': 'Workshop Building',
            'description': 'Central engineering practical laboratories and fabrication workshop bays.',
            'accessibility_info': 'Wide industrial level entrances',
            'is_navigable_destination': True
        },
        {
            'slug': 'auditorium',
            'name': 'Prof. K. Ramakrishna Rao Auditorium',
            'category': 'facility',
            'latitude': 17.73100,
            'longitude': 83.31570,
            'floor_level': 'Ground Floor',
            'block_name': 'Auditorium Complex',
            'description': 'Acoustically treated multi-purpose auditorium for college events, conferences, and technical symposiums.',
            'accessibility_info': 'Ramp at main auditorium portico',
            'is_navigable_destination': True
        },
        {
            'slug': 'seminar_hall',
            'name': 'Dr. Sarvepalli Radhakrishnan Seminar Hall',
            'category': 'facility',
            'latitude': 17.73130,
            'longitude': 83.31550,
            'floor_level': '1st Floor',
            'block_name': 'Administrative Block',
            'description': 'Air-conditioned digital seminar hall for guest lectures, seminars, and meetings in Admin Block.',
            'accessibility_info': 'Accessible via Admin Block elevator',
            'is_navigable_destination': True
        },
        {
            'slug': 'parking',
            'name': 'Campus Parking',
            'category': 'parking',
            'latitude': 17.73070,
            'longitude': 83.31550,
            'floor_level': 'Ground Level',
            'block_name': 'Parking Area',
            'description': 'Dedicated parking bays for student two-wheelers, faculty vehicles, and visitor parking.',
            'accessibility_info': 'Paved level access',
            'is_navigable_destination': True
        },
        {
            'slug': 'health_clinic',
            'name': 'Campus Health Clinic & First Aid',
            'category': 'amenity',
            'latitude': 17.73110,
            'longitude': 83.31545,
            'floor_level': 'Ground Floor',
            'block_name': 'Administrative Wing',
            'description': 'Campus first aid station with medical care and rest beds.',
            'accessibility_info': 'Ground level direct entrance',
            'is_navigable_destination': True
        }
    ]

    loc_objs = {}
    for data in locations_data:
        loc = CampusLocation.query.filter_by(slug=data['slug']).first()
        if not loc:
            loc = CampusLocation(**data)
            db.session.add(loc)
            db.session.flush()
        else:
            for k, v in data.items():
                setattr(loc, k, v)
        loc_objs[data['slug']] = loc
    db.session.commit()

    # 5. Seed Campus Buildings (Entities: Block 7, Block 8)
    b8 = CampusBuilding.query.filter_by(code='BLOCK_8').first()
    if not b8:
        b8 = CampusBuilding(
            name="Block 8",
            code="BLOCK_8",
            description="Engineering building housing CSE (1st Floor), ECE (2nd Floor), EEE (3rd Floor), and Staff Room (1st Floor, beside the lift).",
            total_floors=4,
            location_id=loc_objs['block_8'].id,
            is_verified=True
        )
        db.session.add(b8)
    else:
        b8.name = "Block 8"
        b8.location_id = loc_objs['block_8'].id
        b8.description = "Engineering building housing CSE (1st Floor), ECE (2nd Floor), EEE (3rd Floor), and Staff Room (1st Floor, beside the lift)."

    b7 = CampusBuilding.query.filter_by(code='BLOCK_7').first()
    if not b7:
        b7 = CampusBuilding(
            name="Block 7",
            code="BLOCK_7",
            description="Engineering building housing the Department of Civil Engineering on the 3rd Floor.",
            total_floors=4,
            location_id=loc_objs['block_7'].id,
            is_verified=True
        )
        db.session.add(b7)
    else:
        b7.name = "Block 7"
        b7.location_id = loc_objs['block_7'].id
        b7.description = "Engineering building housing the Department of Civil Engineering on the 3rd Floor."
    db.session.commit()

    # 6. Mapped Campus Pathways (Walkways between physical buildings)
    pathways_data = [
        ('main_gate', 'admin_block', 48.0, 'walkway', True, True, 'Walk straight north along the main avenue to Administrative Block', 'Walk south towards Main Entrance Gate'),
        ('main_gate', 'parking', 30.0, 'road', True, True, 'Turn right towards the campus parking area', 'Walk towards Main Entrance Gate'),
        ('main_gate', 'library', 92.0, 'walkway', True, True, 'Follow the left diagonal paved walkway past the lawns to Central Library', 'Walk southeast towards Main Entrance Gate'),
        
        ('admin_block', 'block_8', 65.0, 'walkway', True, True, 'Walk north along the main central avenue directly to Block 8', 'Walk south from Block 8 to Administrative Block'),
        ('admin_block', 'block_7', 70.0, 'walkway', True, True, 'Walk northeast past the quadrangle to Block 7', 'Walk southwest from Block 7 to Administrative Block'),
        ('admin_block', 'auditorium', 42.0, 'walkway', True, True, 'Walk east past the gardens to the Auditorium entrance', 'Walk west from Auditorium to Administrative Block'),
        ('admin_block', 'seminar_hall', 15.0, 'corridor', True, True, 'Take the central stairs or elevator to 1st Floor, Admin Block', 'Take stairs or elevator down to Ground Floor, Admin Block'),
        ('admin_block', 'health_clinic', 18.0, 'walkway', True, True, 'Walk to the ground floor wing adjacent to admin porch', 'Walk to Administrative Block main doors'),

        ('library', 'block_8', 50.0, 'walkway', True, True, 'Walk east along the paved library walkway toward Block 8 entrance', 'Walk west from Block 8 toward Central Library'),
        ('block_8', 'block_7', 55.0, 'walkway', True, True, 'Walk east along the connecting paved pathway between Block 8 and Block 7', 'Walk west along the connecting pathway from Block 7 to Block 8'),
        ('block_8', 'canteen', 45.0, 'walkway', True, True, 'Walk north from Block 8 directly into the College Canteen', 'Exit Canteen through south entrance toward Block 8'),
        ('block_7', 'canteen', 60.0, 'walkway', True, True, 'Walk northwest from Block 7 along the shaded path to Canteen', 'Walk southeast from Canteen toward Block 7'),
        ('block_7', 'workshop', 40.0, 'walkway', True, True, 'Walk south from Block 7 into the Central Engineering Workshops', 'Walk north from Workshops toward Block 7'),
        ('workshop', 'auditorium', 72.0, 'walkway', True, True, 'Walk southwest along the eastern walkway toward the Auditorium', 'Walk northeast along the walkway toward Workshops')
    ]

    # Clear old pathways and insert updated ones
    CampusPathway.query.delete()
    for from_slug, to_slug, dist, ptype, bidi, acc, f_inst, r_inst in pathways_data:
        from_node = loc_objs.get(from_slug)
        to_node = loc_objs.get(to_slug)
        if from_node and to_node:
            p = CampusPathway(
                from_node_id=from_node.id,
                to_node_id=to_node.id,
                distance_meters=dist,
                pathway_type=ptype,
                is_bidirectional=bidi,
                is_accessible=acc,
                instructions_forward=f_inst,
                instructions_reverse=r_inst
            )
            db.session.add(p)
    db.session.commit()

    # 7. Seed Engineering Departments
    # Confirmed mapping:
    # CSE -> Block 8 -> 1st Floor
    # ECE -> Block 8 -> 2nd Floor
    # EEE -> Block 8 -> 3rd Floor
    # Civil Engineering -> Block 7 -> 3rd Floor
    # (NO Mechanical Engineering!)
    Department.query.delete()
    db.session.commit()

    dept_definitions = [
        {
            'code': 'CSE',
            'name': 'Computer Science and Engineering',
            'description': 'The Department of Computer Science and Engineering offers curriculum in Artificial Intelligence, Software Engineering, and Cloud Technologies.',
            'head_of_department': 'Dr. D. Madhavi',
            'established_year': 2008,
            'student_intake': 180,
            'building_id': b8.id,
            'floor': '1st Floor',
            'location_id': loc_objs['block_8'].id,
            'block_info': 'Block 8, 1st Floor',
            'contact_email': 'cse@bullayyacollege.info',
            'courses': [
                {'name': 'Computer Science and Engineering', 'degree': 'B.Tech', 'duration_years': 4, 'intake': 120, 'eligibility': 'Passed 10+2 with MPC and qualified in AP EAPCET.'},
                {'name': 'CSE (AI & ML)', 'degree': 'B.Tech', 'duration_years': 4, 'intake': 60, 'eligibility': 'Passed 10+2 with MPC and qualified in AP EAPCET.'}
            ],
            'labs': [
                {'name': 'AI & Deep Learning Computing Lab', 'description': 'GPU-accelerated computing environment for machine learning.', 'floor': '1st Floor'},
                {'name': 'Software Engineering Lab', 'description': 'Industry standard development testbeds and software tools.', 'floor': '1st Floor'}
            ]
        },
        {
            'code': 'ECE',
            'name': 'Electronics and Communication Engineering',
            'description': 'The Department of Electronics and Communication Engineering covers VLSI design, embedded systems, microprocessors, and digital communication.',
            'head_of_department': 'Dr. Ch. V. N. Rao',
            'established_year': 2008,
            'student_intake': 120,
            'building_id': b8.id,
            'floor': '2nd Floor',
            'location_id': loc_objs['block_8'].id,
            'block_info': 'Block 8, 2nd Floor',
            'contact_email': 'ece@bullayyacollege.info',
            'courses': [
                {'name': 'Electronics and Communication Engineering', 'degree': 'B.Tech', 'duration_years': 4, 'intake': 120, 'eligibility': 'Passed 10+2 with MPC and qualified in AP EAPCET.'}
            ],
            'labs': [
                {'name': 'Cadence VLSI Design Lab', 'description': 'EDA software and FPGA development boards.', 'floor': '2nd Floor'},
                {'name': 'Microwave & Optical Communications Lab', 'description': 'Spectrum analyzers and communication test benches.', 'floor': '2nd Floor'}
            ]
        },
        {
            'code': 'EEE',
            'name': 'Electrical and Electronics Engineering',
            'description': 'The Department of Electrical and Electronics Engineering focuses on power systems, electrical machines, renewable energy, and control engineering.',
            'head_of_department': 'Dr. S. K. Murthy',
            'established_year': 2008,
            'student_intake': 60,
            'building_id': b8.id,
            'floor': '3rd Floor',
            'location_id': loc_objs['block_8'].id,
            'block_info': 'Block 8, 3rd Floor',
            'contact_email': 'eee@bullayyacollege.info',
            'courses': [
                {'name': 'Electrical and Electronics Engineering', 'degree': 'B.Tech', 'duration_years': 4, 'intake': 60, 'eligibility': 'Passed 10+2 with MPC and qualified in AP EAPCET.'}
            ],
            'labs': [
                {'name': 'Electrical Machines Laboratory', 'description': 'DC machines, induction motors, and synchronous generators.', 'floor': '3rd Floor'},
                {'name': 'Power Electronics & Drives Lab', 'description': 'Industrial drives and semiconductor converter systems.', 'floor': '3rd Floor'}
            ]
        },
        {
            'code': 'CIVIL',
            'name': 'Civil Engineering',
            'description': 'The Department of Civil Engineering prepares students in structural engineering, geotechnical analysis, surveying, and infrastructure development.',
            'head_of_department': 'Dr. N. B. S. Rao',
            'established_year': 2010,
            'student_intake': 60,
            'building_id': b7.id,
            'floor': '3rd Floor',
            'location_id': loc_objs['block_7'].id,
            'block_info': 'Block 7, 3rd Floor',
            'contact_email': 'civil@bullayyacollege.info',
            'courses': [
                {'name': 'Civil Engineering', 'degree': 'B.Tech', 'duration_years': 4, 'intake': 60, 'eligibility': 'Passed 10+2 with MPC and qualified in AP EAPCET.'}
            ],
            'labs': [
                {'name': 'Strength of Materials Lab', 'description': 'Universal Testing Machine and structural testing apparatus.', 'floor': '3rd Floor'},
                {'name': 'Surveying & Total Station Lab', 'description': 'Digital theodolites, Total Stations, and leveling instruments.', 'floor': '3rd Floor'}
            ]
        }
    ]

    for d in dept_definitions:
        dept = Department(
            code=d['code'],
            name=d['name'],
            description=d['description'],
            head_of_department=d['head_of_department'],
            established_year=d['established_year'],
            student_intake=d['student_intake'],
            building_id=d['building_id'],
            floor=d['floor'],
            location_id=d['location_id'],
            block_info=d['block_info'],
            contact_email=d['contact_email'],
            is_published=True,
            is_verified=True
        )
        db.session.add(dept)
        db.session.flush()

        for c in d['courses']:
            course = Course(department_id=dept.id, **c)
            db.session.add(course)

        for lab in d['labs']:
            dlab = DepartmentLab(department_id=dept.id, location_id=d['location_id'], **lab)
            db.session.add(dlab)
    db.session.commit()

    # 8. Seed Verified Facilities (Including Staff Room in Block 8, 1st Floor beside the lift)
    Facility.query.delete()
    db.session.commit()

    facilities_data = [
        {
            'name': 'Staff Room',
            'category': 'academic',
            'description': 'Engineering faculty staff room for professors, academic counseling, and student advisement.',
            'operating_hours': '09:00 AM - 05:00 PM (Monday to Saturday)',
            'location_id': loc_objs['staff_room'].id,
            'floor_level': '1st Floor, beside the lift',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Dr. Lankapalli Bullayya Central Library',
            'category': 'academic',
            'description': 'Automated campus library featuring 35,000+ technical volumes, digital journals, and reading halls.',
            'operating_hours': '08:00 AM - 07:00 PM (Monday to Saturday)',
            'location_id': loc_objs['library'].id,
            'floor_level': 'Ground & 1st Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'College Canteen',
            'category': 'dining',
            'description': 'Hygienic campus cafeteria offering nutritious breakfast, lunch meals, fresh juices, and tea.',
            'operating_hours': '07:30 AM - 06:00 PM (Monday to Saturday)',
            'location_id': loc_objs['canteen'].id,
            'floor_level': 'Ground Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Administrative Office & Principal Office',
            'category': 'administrative',
            'description': 'Houses Principal Chamber, Administrative Inquiries, Admissions Counseling Desk, Accounts, and Academic Dean.',
            'operating_hours': '09:00 AM - 05:00 PM (Monday to Saturday)',
            'location_id': loc_objs['admin_block'].id,
            'floor_level': 'Ground & 1st Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Laboratories & Workshop',
            'category': 'academic',
            'description': 'Hands-on engineering workshops and computing laboratories for undergraduate practical training.',
            'operating_hours': '09:00 AM - 05:00 PM (During lab sessions)',
            'location_id': loc_objs['workshop'].id,
            'floor_level': 'Ground Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Prof. K. Ramakrishna Rao Auditorium',
            'category': 'amenity',
            'description': 'Acoustically treated multi-purpose auditorium for college convocations, conferences, and fests.',
            'operating_hours': 'Open during academic events and fests',
            'location_id': loc_objs['auditorium'].id,
            'floor_level': 'Ground Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Dr. Sarvepalli Radhakrishnan Seminar Hall',
            'category': 'academic',
            'description': 'Digital seminar hall located in Admin Block for technical seminars and guest presentations.',
            'operating_hours': '09:00 AM - 05:00 PM (On booking)',
            'location_id': loc_objs['seminar_hall'].id,
            'floor_level': '1st Floor, Admin Block',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Campus Parking',
            'category': 'amenity',
            'description': 'Designated parking bays for student two-wheelers, faculty vehicles, and visitor parking.',
            'operating_hours': '07:00 AM - 07:00 PM',
            'location_id': loc_objs['parking'].id,
            'floor_level': 'Ground Level',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        },
        {
            'name': 'Campus Health Clinic & First Aid',
            'category': 'amenity',
            'description': 'Medical station providing immediate first aid and healthcare support to students and staff.',
            'operating_hours': '09:00 AM - 05:00 PM',
            'location_id': loc_objs['health_clinic'].id,
            'floor_level': 'Ground Floor',
            'image_url': '',
            'is_published': True,
            'is_verified': True
        }
    ]

    for f in facilities_data:
        fac = Facility(**f)
        db.session.add(fac)
    db.session.commit()

    # 9. Knowledge Base & FAQs (Accurate Ratna Q&As)
    FAQKnowledge.query.delete()
    db.session.commit()

    faqs_data = [
        {
            'category': 'navigation',
            'question': 'Where is CSE?',
            'answer': 'CSE is located in Block 8, 1st Floor.',
            'keywords': 'cse, computer science, block 8, floor 1, where'
        },
        {
            'category': 'navigation',
            'question': 'Where is ECE?',
            'answer': 'ECE is located in Block 8, 2nd Floor.',
            'keywords': 'ece, electronics, block 8, floor 2, where'
        },
        {
            'category': 'navigation',
            'question': 'Where is EEE?',
            'answer': 'EEE is located in Block 8, 3rd Floor.',
            'keywords': 'eee, electrical, block 8, floor 3, where'
        },
        {
            'category': 'navigation',
            'question': 'Where is Civil Engineering?',
            'answer': 'Civil Engineering is located in Block 7, 3rd Floor.',
            'keywords': 'civil, civil engineering, block 7, floor 3, where'
        },
        {
            'category': 'navigation',
            'question': 'Where is the staff room?',
            'answer': 'The Staff Room is located in Block 8, 1st Floor, beside the lift.',
            'keywords': 'staff room, faculty, block 8, floor 1, beside lift, where'
        },
        {
            'category': 'navigation',
            'question': 'Which departments are in Block 8?',
            'answer': 'Block 8 houses Computer Science & Engineering (1st Floor), Electronics & Communication Engineering (2nd Floor), Electrical & Electronics Engineering (3rd Floor), and the Staff Room (1st Floor, beside the lift).',
            'keywords': 'block 8, cse, ece, eee, staff room, departments'
        },
        {
            'category': 'navigation',
            'question': 'Which department is in Block 7?',
            'answer': 'Block 7 houses the Department of Civil Engineering on the 3rd Floor.',
            'keywords': 'block 7, civil, civil engineering, department'
        },
        {
            'category': 'navigation',
            'question': 'How do I reach CSE from the main gate?',
            'answer': 'From the Main Gate, walk north along the central avenue to Block 8. The CSE Department is located on the 1st Floor of Block 8.',
            'keywords': 'main gate to cse, cse route, block 8'
        },
        {
            'category': 'navigation',
            'question': 'Where is the Central Library located?',
            'answer': 'The Central Library is situated on the western side of the campus grounds, approximately 92 meters from the Main Gate.',
            'keywords': 'library, central library, reading room'
        },
        {
            'category': 'navigation',
            'question': 'Where is the College Canteen located?',
            'answer': 'The College Canteen is located on the north side of the campus, directly behind Block 8.',
            'keywords': 'canteen, food, cafeteria, breakfast, lunch'
        },
        {
            'category': 'admissions',
            'question': 'What is the AP EAPCET college counseling code?',
            'answer': 'The official counseling code for Dr. Lankapalli Bullayya College of Engineering in AP EAPCET is DLBC.',
            'keywords': 'eapcet code, dlbc, counseling code, code'
        },
        {
            'category': 'general',
            'question': 'What is the college address and contact number?',
            'answer': 'Dr. Lankapalli Bullayya College of Engineering is located at New Resapuvanipalem, Visakhapatnam, Andhra Pradesh 530013. Phone: +91 891 2701819, Email: info@bullayyacollege.info.',
            'keywords': 'address, phone, contact, email, location'
        }
    ]

    for faq in faqs_data:
        f = FAQKnowledge(**faq)
        db.session.add(f)
    db.session.commit()
    print("Database successfully reseeded with verified Block 7, Block 8, and department locations!")

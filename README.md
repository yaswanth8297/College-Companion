# College Companion
### AI-Powered College Information & Smart Campus Navigation Platform
**Institution:** Dr. Lankapalli Bullayya College of Engineering, Visakhapatnam, Andhra Pradesh, India  
**EAPCET Counseling Code:** DLBC

---

## 🏛️ Project Overview

**College Companion** is an internship-grade, full-stack web application designed for students, parents, faculty, and visitors at **Dr. Lankapalli Bullayya College of Engineering (DLBCOE)** in Visakhapatnam. The platform eliminates the need to ask for directions by delivering:

1. **Smart Campus Navigation:** A graph-based pathway routing engine (Dijkstra algorithm) running over verified campus nodes, building entrances, and walkways. Features step-by-step turn directions, 2D building footprint polygons with interactive floor directories, animated walking simulation, multi-tile layer switcher (Voyager Detailed, Street Map, Satellite Aerial), estimated walking distance, estimated walk time, wheelchair accessibility filters, and shareable destination links.
2. **AI College Assistant (Ratna):** A conversational assistant named **Ratna** that answers college questions using verified knowledge and dynamically calculates campus walking directions when asked (e.g. *"How do I reach the library from the main gate?"*). Supports both Google Gemini API integration and an intelligent offline rule/semantic knowledge base with fallback for zero external dependencies.
3. **Institutional CMS & Admin Dashboard:** Secured with JWT authentication to manage departments, facilities, campus nodes, pathway edges, FAQs, and visitor unanswered inquiries.

---

## 🎨 Design System

Built strictly according to university brand specifications:
- **Primary Background:** `#F0EEE6`
- **Primary Pink:** `#F6C2D3`
- **Secondary Pink:** `#F4B1C8`
- **Accent Pink:** `#EF83B9`
- **Green Accent:** `#9DCD59`
- **Typography:** Inter sans-serif, clean hierarchy, high contrast
- **Design Principles:** Flat design, no excessive gradients, no fake stats, verified data tags

---

## 📁 Project Structure

```
college-companion/
├── backend/
│   ├── app/
│   │   ├── chatbot/          # Intent detection, RAG engine, Gemini / Rule-based fallback
│   │   ├── models/           # SQLAlchemy models (User, College, Navigation, Chat)
│   │   ├── navigation/       # Dijkstra shortest path, bearings, walking step generator
│   │   ├── routes/           # REST APIs (auth, college, navigation, chat, admin)
│   │   ├── services/         # Database seeding with real DLBCOE data
│   │   └── utils/
│   ├── config.py             # App configuration & environment binding
│   ├── run.py                # Server runner
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
├── database/
│   └── college.db            # SQLite database (migratable to PostgreSQL)
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, FloatingChatWidget, GlobalSearchModal
│   │   ├── pages/            # Home, Explore, CampusMap, Departments, Facilities, Admissions, AskAI, Contact, Admin
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Routing configuration
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind & Leaflet styles
│   ├── tailwind.config.js    # Exact brand color palette definitions
│   └── vite.config.js        # Vite dev server with /api proxy
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python:** 3.10+ (tested with Python 3.13)
- **Node.js:** v18+ (tested with Node v24)
- **Package Managers:** `pip` and `npm`

---

### 2. Backend Setup

```bash
cd college-companion/backend

# Optional: Create virtual environment
# python -m venv venv
# venv\Scripts\activate  (Windows)

# Install dependencies
py -m pip install -r requirements.txt

# Start the Flask API server (runs on port 5000)
py run.py
```
> *On first run, the database automatically initializes at `college-companion/database/college.db` and populates with verified Dr. Lankapalli Bullayya College of Engineering data.*

#### Admin Credentials:
- **Username:** `admin`
- **Password:** `adminpassword123`

---

### 3. Frontend Setup

In a new terminal:

```bash
cd college-companion/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/college` | `GET` | Institutional overview, vision, mission, contacts |
| `/api/departments` | `GET` | List of engineering departments, HODs, labs, courses |
| `/api/facilities` | `GET` | Campus amenities, operating hours, coordinates |
| `/api/admissions` | `GET` | EAPCET, ECET, Category-B criteria and checklist |
| `/api/locations` | `GET` | Campus navigation nodes and landmarks |
| `/api/navigation/route` | `POST` | Calculates Dijkstra shortest walking path |
| `/api/navigation/pathways` | `GET` | All mapped campus pathways |
| `/api/chat` | `POST` | AI assistant with RAG & automatic route calculation |
| `/api/chat/history` | `GET` | Conversation history for session |
| `/api/chat/feedback` | `POST` | User helpfulness feedback and campus correction reports |
| `/api/auth/login` | `POST` | Admin authentication with JWT |
| `/api/admin/*` | `CRUD` | Locations, pathways, departments, FAQs, unanswered questions |

---

## 🧪 Verified Navigation & Chat Test Cases

1. **Walking to Central Library:**
   - Query: *"How do I reach the library from the main gate?"*
   - Calculated: 92 meters, ~1 min walk along diagonal paved walkway.
2. **Finding Canteen:**
   - Query: *"Where is the college canteen?"*
   - Explains location (Cafeteria Complex, Ground Floor) and prompts: *"Would you like walking directions from the Main Gate?"*
   - Answering *"Yes"* immediately invokes the navigation engine and highlights the route!
3. **Wheelchair Accessible Routing:**
   - Toggling the *Step-Free Accessible* filter excludes any stairways and routes exclusively via paved ground avenues and ramps.

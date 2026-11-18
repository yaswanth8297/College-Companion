import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Bot, 
  Search, 
  BookOpen, 
  Building2, 
  Coffee, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  Car, 
  Users, 
  Activity, 
  Award,
  Sparkles,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { getLocations, getDepartments, getCollegeInfo } from '../services/api';

export default function Home() {
  const [destinationQuery, setDestinationQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [locs, info] = await Promise.all([
          getLocations('', true),
          getCollegeInfo()
        ]);
        setLocations(locs);
        setCollegeInfo(info);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const handleDestinationSearch = (e) => {
    e.preventDefault();
    if (!destinationQuery.trim()) {
      navigate('/campus-map');
      return;
    }
    const matched = locations.find(l => 
      l.name.toLowerCase().includes(destinationQuery.toLowerCase()) ||
      l.slug.toLowerCase().includes(destinationQuery.toLowerCase())
    );
    if (matched) {
      navigate(`/campus-map?to=${matched.slug}`);
    } else {
      navigate(`/campus-map?q=${encodeURIComponent(destinationQuery)}`);
    }
  };

  const handleChatPreviewSubmit = (q) => {
    navigate(`/ask-ai?q=${encodeURIComponent(q)}`);
  };

  // Colourful Quick access shortcuts with custom pastel colors & distinct accents
  const quickAccessItems = [
    { name: 'Main Gate', slug: 'main_gate', category: 'Entrance', icon: Compass, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-500' },
    { name: 'Central Library', slug: 'library', category: 'Knowledge', icon: BookOpen, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', iconBg: 'bg-cyan-500' },
    { name: 'College Canteen', slug: 'canteen', category: 'Food Court', icon: Coffee, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-500' },
    { name: 'Administrative Office', slug: 'admin_block', category: 'Admin', icon: Building2, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-500' },
    { name: 'Principal Office', slug: 'admin_block', category: 'Chamber', icon: Award, bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', iconBg: 'bg-pink-500' },
    { name: 'Block A (CSE & IT)', slug: 'block_a', category: 'Computer Dept', icon: Building2, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-500' },
    { name: 'Block B (ECE & EEE)', slug: 'block_b', category: 'Electronics Dept', icon: Building2, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-500' },
    { name: 'Block C (Civil & Mech)', slug: 'block_c', category: 'Mech & Civil', icon: Building2, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', iconBg: 'bg-teal-500' },
    { name: 'Laboratories & Workshop', slug: 'workshop', category: 'Hands-on Labs', icon: Activity, bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-500' },
    { name: 'Seminar Hall', slug: 'seminar_hall', category: 'Audio-Visual', icon: Users, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-500' },
    { name: 'Auditorium', slug: 'auditorium', category: 'Events', icon: Users, bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', iconBg: 'bg-fuchsia-500' },
    { name: 'Campus Parking', slug: 'parking_two_wheeler', category: 'Transit', icon: Car, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', iconBg: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      {/* Hero Section with Vibrant Accents */}
      <section className="border-b border-[#E3DFD3] pt-14 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFDF9] via-[#FBF9F5] to-[#F0EEE6]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Verified institution badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#9DCD59]/30 to-[#EF83B9]/30 text-[#1A1C1E] text-xs font-bold border border-[#9DCD59]/40 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-[#2D5A12]" />
            <span>Dr. Lankapalli Bullayya College of Engineering • Visakhapatnam</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1A1C1E] tracking-tight leading-tight">
            Your College, One Smart Companion
          </h1>

          <p className="text-base sm:text-lg text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
            Explore your campus with interactive 2D building footprints, discover departments, and navigate directly with help from <strong className="text-[#EF83B9]">Ratna</strong>, our intelligent AI companion.
          </p>

          {/* Main Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/campus-map"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#EF83B9] to-[#D9529B] hover:opacity-95 text-white font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-md transform hover:scale-102"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Explore Campus Map</span>
            </Link>

            <Link
              to="/ask-ai"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#FBF9F5] text-[#1A1C1E] border-2 border-[#E3DFD3] hover:border-[#EF83B9] font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#EF83B9]" />
              <span>Ask Ratna (AI)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature A: Smart Campus Navigation Preview with Colourful Footprints */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E3DFD3]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-[#E3DFD3] p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-[#EF83B9]/20 to-[#9DCD59]/30 rounded-full text-xs font-bold text-[#A21B66]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dijkstra Graph Pathway Engine</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1E] tracking-tight">
                  Smart Campus Navigation System
                </h2>
                <p className="text-sm text-[#4A5568] leading-relaxed">
                  Interactive building footprints across engineering departments, laboratories, administrative blocks, central library, and cafeteria. Calculates turn-by-turn routes with distance in meters and walking time.
                </p>

                {/* "Where do you want to go?" Search Form */}
                <form onSubmit={handleDestinationSearch} className="pt-2">
                  <label className="text-xs font-bold text-[#1A1C1E] block mb-1.5">
                    Where do you want to go?
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={destinationQuery}
                        onChange={(e) => setDestinationQuery(e.target.value)}
                        placeholder="Search Central Library, Canteen, Block A..."
                        className="w-full pl-10 pr-3 py-3 text-xs bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden focus:border-[#EF83B9]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-black text-xs rounded-xl transition-all shrink-0 shadow-xs"
                    >
                      Find Route
                    </button>
                  </div>
                </form>

                <div className="pt-2">
                  <Link
                    to="/campus-map"
                    className="inline-flex items-center text-xs font-extrabold text-[#EF83B9] hover:underline"
                  >
                    <span>Open Full Interactive 2D Campus Map</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Visual Map Preview Card with Colourful Highlights */}
              <div className="lg:col-span-7 bg-gradient-to-br from-[#FBF9F5] to-[#F0EEE6] rounded-2xl border border-[#E3DFD3] p-4 relative overflow-hidden shadow-inner">
                <div className="h-64 sm:h-76 rounded-xl bg-white flex flex-col justify-between p-4 relative border border-[#E3DFD3] shadow-xs">
                  {/* Mock map header */}
                  <div className="flex items-center justify-between">
                    <div className="bg-[#F0EEE6] px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#1A1C1E] border border-[#E3DFD3] flex items-center space-x-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#EF83B9]" />
                      <span>DLBCOE Campus Map Layer</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] font-extrabold bg-[#9DCD59]/30 text-[#2D5A12] px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-[#9DCD59] animate-pulse mr-1"></span>
                      Graph Engine Ready
                    </div>
                  </div>

                  {/* Route overlay preview */}
                  <div className="space-y-2.5 max-w-sm bg-[#FFFDF9] p-3.5 rounded-xl border border-[#E3DFD3] shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2D5A12] flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-[#9DCD59]" />
                        Main Gate ➔ Central Library
                      </span>
                      <span className="text-[#EF83B9]">92 meters (~1 min)</span>
                    </div>
                    <div className="w-full bg-[#E3DFD3] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#9DCD59] to-[#EF83B9] h-full w-4/5 rounded-full"></div>
                    </div>
                    <p className="text-[11px] text-[#4A5568]">
                      Paved diagonal walkway past the front gardens directly into the library portico.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/campus-map?from=main_gate&to=library"
                      className="px-4 py-2 bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all"
                    >
                      Launch Active Route
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature D: Colourful Quick Access Shortcuts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E3DFD3]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#EF83B9] block">
                Direct Landmark Navigation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1C1E] tracking-tight">
                Quick Access Campus Destinations
              </h2>
            </div>
            <Link
              to="/campus-map"
              className="text-xs font-bold text-[#EF83B9] hover:underline flex items-center"
            >
              <span>View All 16 Campus Landmarks</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickAccessItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(`/campus-map?to=${item.slug}`)}
                  className={`p-4 ${item.bg} rounded-2xl border ${item.border} hover:border-[#EF83B9] text-left transition-all group flex flex-col justify-between hover:shadow-sm transform hover:-translate-y-0.5`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2.5 rounded-xl ${item.iconBg} text-white shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#718096] group-hover:text-[#EF83B9] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1C1E] leading-snug">
                      {item.name}
                    </h3>
                    <span className={`text-[10px] ${item.text} font-bold block mt-1`}>
                      {item.category} • Ground Map
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature B: Meet Ratna - AI College Companion */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E3DFD3] bg-gradient-to-b from-[#FFFDF9] to-[#F0EEE6]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-[#EF83B9]/20 to-[#9DCD59]/30 rounded-full text-xs font-bold text-[#A21B66]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI College Assistant</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1C1E] tracking-tight">
                Meet Ratna, Your Smart Campus Assistant
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Ratna is trained on Dr. Lankapalli Bullayya College of Engineering's verified knowledge base and graph navigation engine. Ratna answers academic queries and calculates instant walking directions.
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#1A1C1E] block">
                  Click a suggested question for Ratna:
                </span>
                <div className="space-y-1.5">
                  {[
                    "How do I reach the library from the main gate?",
                    "Where is the college canteen?",
                    "What are the admission requirements for B.Tech?",
                    "What are the central library working hours?"
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleChatPreviewSubmit(q)}
                      className="w-full text-left p-3 bg-white rounded-xl border border-[#E3DFD3] hover:border-[#EF83B9] text-xs font-medium text-[#1A1C1E] hover:text-[#EF83B9] transition-all flex items-center justify-between shadow-2xs"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#EF83B9]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratna Chatbot Preview Window */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3DFD3] p-5 shadow-sm space-y-3">
              <div className="bg-gradient-to-r from-[#EF83B9] to-[#D9529B] rounded-2xl p-4 flex items-center justify-between text-white shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block leading-tight">Ratna (AI Assistant)</span>
                    <span className="text-[10px] text-white/90">Online • Verified Knowledge</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
                  Ready to Assist
                </span>
              </div>

              {/* Sample Dialog */}
              <div className="space-y-3 py-2 text-xs">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white font-medium px-4 py-2.5 rounded-2xl rounded-br-none max-w-sm shadow-2xs">
                    How do I reach the Central Library from the main gate?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#F0EEE6] text-[#1A1C1E] px-4 py-3 rounded-2xl rounded-bl-none max-w-md border border-[#E3DFD3] space-y-2.5 shadow-2xs">
                    <p className="font-semibold text-xs">
                      Walking directions from <strong>Main Entrance Gate</strong> to <strong>Central Library</strong> (92 meters, ~1 min walk):
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 font-medium text-[11px] text-[#4A5568]">
                      <li>Start from Main Entrance Gate.</li>
                      <li>Follow the left diagonal paved walkway past the lawns towards Central Library (92m).</li>
                      <li>Arrive at Dr. Lankapalli Bullayya Central Library (Library Block).</li>
                    </ol>
                    <Link
                      to="/campus-map?from=main_gate&to=library"
                      className="inline-flex items-center text-xs font-bold text-[#1A1C1E] bg-[#9DCD59] hover:bg-[#8ABF44] px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>View Route on Campus Map</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/ask-ai"
                  className="block text-center py-2.5 bg-[#F0EEE6] hover:bg-[#E3DFD3] text-[#1A1C1E] font-bold text-xs rounded-xl transition-colors"
                >
                  Chat with Ratna on Dedicated AI Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature C: Explore College Highlights */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EF83B9] block">
              About Dr. Lankapalli Bullayya College of Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1C1E] tracking-tight">
              A Legacy of Engineering Excellence
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5568]">
              Established under The Society for Collegiate Education in honor of former Andhra University Vice-Chancellor Dr. Lankapalli Bullayya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1C1E]">Prime City Campus</h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Centrally located at New Resapuvanipalem, Visakhapatnam, offering modern engineering infrastructure, fiber connectivity, and dedicated academic blocks.
              </p>
              <Link to="/explore" className="text-xs font-bold text-[#EF83B9] inline-flex items-center">
                <span>Read Campus History</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1C1E]">Accreditations & Affiliation</h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Approved by AICTE, New Delhi, and affiliated to Andhra University / JNTU-GV, ensuring rigorous academic standards and industry-aligned syllabi.
              </p>
              <Link to="/departments" className="text-xs font-bold text-[#EF83B9] inline-flex items-center">
                <span>Explore Departments</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1C1E]">Admissions & Scholarships</h3>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                Counseling code DLBC for AP EAPCET. Full eligibility for government fee reimbursement programs and merit assistance.
              </p>
              <Link to="/admissions" className="text-xs font-bold text-[#EF83B9] inline-flex items-center">
                <span>View Admission Guide</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

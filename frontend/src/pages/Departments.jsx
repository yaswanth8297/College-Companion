import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  BookOpen, 
  Users, 
  Compass, 
  CheckCircle, 
  Search, 
  ArrowRight,
  GraduationCap,
  FlaskConical,
  Sparkles,
  Award,
  Cpu
} from 'lucide-react';
import { getDepartments } from '../services/api';

const DEPT_THEMES = {
  CSE: { badge: 'bg-blue-100 text-blue-800 border-blue-200', ribbon: 'bg-blue-600', card: 'border-blue-200 bg-blue-50/30' },
  IT: { badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', ribbon: 'bg-cyan-600', card: 'border-cyan-200 bg-cyan-50/30' },
  ECE: { badge: 'bg-orange-100 text-orange-800 border-orange-200', ribbon: 'bg-orange-600', card: 'border-orange-200 bg-orange-50/30' },
  EEE: { badge: 'bg-amber-100 text-amber-800 border-amber-200', ribbon: 'bg-amber-600', card: 'border-amber-200 bg-amber-50/30' },
  MECH: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', ribbon: 'bg-emerald-600', card: 'border-emerald-200 bg-emerald-50/30' },
  CIVIL: { badge: 'bg-teal-100 text-teal-800 border-teal-200', ribbon: 'bg-teal-600', card: 'border-teal-200 bg-teal-50/30' },
};

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCode, setFilterCode] = useState('ALL');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function load() {
      try {
        const data = await getDepartments();
        setDepartments(data);
        if (data.length > 0) {
          const hash = location.hash.replace('#', '').toUpperCase();
          const matched = data.find(d => d.code === hash);
          setSelectedDept(matched || data[0]);
          if (matched) setFilterCode(matched.code);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.hash]);

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setFilterCode(dept.code);
  };

  const currentTheme = selectedDept ? DEPT_THEMES[selectedDept.code] || DEPT_THEMES.CSE : DEPT_THEMES.CSE;

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9DCD59]/30 to-[#EF83B9]/30 text-[#1A1C1E] text-xs font-bold border border-[#9DCD59]/40 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-[#2D5A12]" />
            <span>AICTE Approved Engineering Branches • Visakhapatnam Campus</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1C1E] tracking-tight">
            Academic Departments
          </h1>
          <p className="text-sm text-[#4A5568] max-w-2xl leading-relaxed">
            Explore our engineering branches, specialized research laboratories, curriculum, and faculty leadership with one-click campus navigation.
          </p>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              setFilterCode('ALL');
              if (departments.length > 0) setSelectedDept(departments[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filterCode === 'ALL'
                ? 'bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white shadow-xs scale-102'
                : 'bg-white text-[#4A5568] border border-[#E3DFD3] hover:bg-[#E3DFD3]'
            }`}
          >
            All Departments ({departments.length})
          </button>
          {departments.map((d) => {
            const theme = DEPT_THEMES[d.code] || DEPT_THEMES.CSE;
            return (
              <button
                key={d.id}
                onClick={() => handleDeptSelect(d)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  selectedDept?.id === d.id
                    ? 'bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white shadow-xs scale-102'
                    : 'bg-white text-[#4A5568] border border-[#E3DFD3] hover:bg-[#E3DFD3]'
                }`}
              >
                <span>{d.code}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Department Showcase */}
        {selectedDept && (
          <div className="bg-white rounded-3xl border border-[#E3DFD3] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            {/* Thematic top colored ribbon */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${currentTheme.ribbon}`}></div>

            {/* Top Bar with Department Code and Navigation CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E3DFD3] gap-4 pt-1">
              <div className="space-y-1">
                <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentTheme.badge}`}>
                  {selectedDept.code} Engineering
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A1C1E]">
                  {selectedDept.name}
                </h2>
                <p className="text-xs text-[#718096] font-medium">
                  {selectedDept.block_info} • Established in {selectedDept.established_year} • Student Intake: {selectedDept.student_intake} seats
                </p>
              </div>

              {/* Connected "Find This Department" Button */}
              {selectedDept.location_slug && (
                <button
                  onClick={() => navigate(`/campus-map?to=${selectedDept.location_slug}`)}
                  className="px-5 py-3 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-black text-xs rounded-xl transition-all flex items-center space-x-2 shrink-0 shadow-xs transform hover:scale-102"
                >
                  <Compass className="w-4 h-4 text-[#1A1C1E]" />
                  <span>Find This Department on Campus Map</span>
                </button>
              )}
            </div>

            {/* Department Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096]">Overview</h3>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
                {selectedDept.description}
              </p>
            </div>

            {/* Department Leadership & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-gradient-to-br from-[#FBF9F5] to-[#F0EEE6] rounded-xl border border-[#E3DFD3] shadow-2xs">
                <span className="text-[#718096] block text-[11px] font-semibold">Head of Department</span>
                <span className="font-extrabold text-[#1A1C1E] text-xs">{selectedDept.head_of_department || 'Information to be confirmed'}</span>
              </div>
              <div className="p-3.5 bg-gradient-to-br from-[#FBF9F5] to-[#F0EEE6] rounded-xl border border-[#E3DFD3] shadow-2xs">
                <span className="text-[#718096] block text-[11px] font-semibold">Campus Block</span>
                <span className="font-extrabold text-[#1A1C1E] text-xs">{selectedDept.block_info}</span>
              </div>
              <div className="p-3.5 bg-gradient-to-br from-[#FBF9F5] to-[#F0EEE6] rounded-xl border border-[#E3DFD3] shadow-2xs">
                <span className="text-[#718096] block text-[11px] font-semibold">Official Contact</span>
                <span className="font-extrabold text-[#1A1C1E] text-xs">{selectedDept.contact_email}</span>
              </div>
            </div>

            {/* Offered Courses & Degrees */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-[#EF83B9]" />
                <span>Offered Degree Programs</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDept.courses?.map((c) => (
                  <div key={c.id} className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E3DFD3] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#1A1C1E]">{c.degree} in {c.name}</h4>
                      <span className="text-[10px] font-bold bg-[#EF83B9]/20 text-[#D9529B] px-2.5 py-0.5 rounded-full">
                        Intake: {c.intake} seats
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5568]">Duration: {c.duration_years} Years</p>
                    <p className="text-[11px] text-[#718096]">Eligibility: {c.eligibility}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Departmental Laboratories with Colourful Cards */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] flex items-center space-x-1.5">
                <FlaskConical className="w-4 h-4 text-[#EF83B9]" />
                <span>Specialized Research & Practical Laboratories</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedDept.labs?.map((l) => (
                  <div key={l.id} className={`p-4 rounded-2xl border ${currentTheme.card} space-y-1.5 shadow-2xs`}>
                    <h4 className="font-bold text-xs text-[#1A1C1E]">{l.name}</h4>
                    <span className="text-[10px] font-semibold text-[#718096] block">
                      Room: {l.room_number || 'N/A'} • {l.floor || 'N/A'}
                    </span>
                    <p className="text-[11px] text-[#4A5568] leading-relaxed pt-1">
                      {l.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Mail, MapPin } from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'Computer Science and Engineering',
  'Civil Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Basic Sciences and Humanities',
];

const DESIGNATIONS = [
  'All',
  'Professor & Head of Department',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
];

const AVATAR_COLORS = ['bg-[#EF83B9]', 'bg-[#9DCD59]', 'bg-[#F4B1C8]', 'bg-[#F6C2D3]'];

function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getAvatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [desig, setDesig] = useState('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let url = '/api/faculty?';
        if (dept !== 'All') url += `department=${encodeURIComponent(dept)}&`;
        if (desig !== 'All') url += `designation=${encodeURIComponent(desig)}&`;
        if (search) url += `q=${encodeURIComponent(search)}&`;
        const res = await fetch(url);
        const data = await res.json();
        setFaculty(Array.isArray(data) ? data : []);
      } catch {
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, dept, desig]);

  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      {/* Hero */}
      <div className="bg-[#F4B1C8] px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-[#EF83B9] rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A1C1E]">Faculty Directory</h1>
              <p className="text-sm text-[#1A1C1E]">Dr. Lankapalli Bullayya College of Engineering</p>
            </div>
          </div>
          <p className="text-sm text-[#1A1C1E] max-w-xl">
            Meet our experienced faculty members across all departments.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-[#E3DFD3] space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#4A5568]" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E3DFD3] rounded-lg focus:outline-none focus:border-[#EF83B9] bg-[#F0EEE6] text-[#1A1C1E]"
              placeholder="Search faculty by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="text-xs border border-[#E3DFD3] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
            >
              {DEPARTMENTS.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={desig}
              onChange={e => setDesig(e.target.value)}
              className="text-xs border border-[#E3DFD3] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
            >
              {DESIGNATIONS.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-[#E3DFD3] animate-pulse space-y-3"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#F0EEE6] rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F0EEE6] rounded w-3/4" />
                    <div className="h-3 bg-[#F0EEE6] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-[#F0EEE6] rounded w-full" />
                <div className="h-3 bg-[#F0EEE6] rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : faculty.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E3DFD3]">
            <Users className="w-12 h-12 text-[#EF83B9] mx-auto mb-4 opacity-50" />
            <p className="font-bold text-[#1A1C1E]">No faculty found</p>
            <p className="text-sm text-[#4A5568] mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map(f => (
              <div
                key={f.id}
                className={`bg-white rounded-xl p-5 border ${
                  f.is_hod ? 'border-[#9DCD59]' : 'border-[#E3DFD3]'
                }`}
              >
                <div className="flex items-start space-x-4 mb-3">
                  {f.photo_url ? (
                    <img
                      src={f.photo_url}
                      alt={f.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#F4B1C8] flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full ${getAvatarColor(f.name)} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}
                    >
                      {getInitials(f.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {f.is_hod && (
                      <span className="inline-block bg-[#9DCD59] text-[#1A1C1E] text-[10px] font-black px-2 py-0.5 rounded mb-1">
                        HOD
                      </span>
                    )}
                    <h3 className="font-black text-[#1A1C1E] text-sm leading-tight">{f.name}</h3>
                    <p className="text-xs font-semibold text-[#EF83B9]">{f.designation}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-[#1A1C1E] flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#EF83B9] flex-shrink-0" />
                    <span className="truncate">{f.department}</span>
                  </p>
                  {f.qualification && (
                    <p className="text-xs text-[#4A5568]">{f.qualification}</p>
                  )}
                  {f.specialization && (
                    <p className="text-[11px] text-[#4A5568]">Expertise: {f.specialization}</p>
                  )}
                  {f.email && (
                    <a
                      href={`mailto:${f.email}`}
                      className="text-[11px] text-[#EF83B9] hover:underline flex items-center space-x-1"
                    >
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{f.email}</span>
                    </a>
                  )}
                  {f.office_location && (
                    <p className="text-[11px] text-[#4A5568] flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#9DCD59] flex-shrink-0" />
                      <span>{f.office_location}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

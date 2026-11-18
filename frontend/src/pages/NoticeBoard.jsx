import React, { useState, useEffect } from 'react';
import { Bell, Pin, AlertTriangle, Search, Calendar, ExternalLink, Paperclip } from 'lucide-react';

const API = '/api';

const CATEGORIES = [
  { value: 'ALL', label: 'All Notices' },
  { value: 'general', label: 'General' },
  { value: 'examination', label: 'Examinations' },
  { value: 'academic', label: 'Academic' },
  { value: 'department', label: 'Department' },
  { value: 'events', label: 'Events & Workshops' },
  { value: 'holiday', label: 'Holidays' },
  { value: 'important', label: 'Important' },
];

const DEPT_OPTIONS = [
  'All Departments',
  'Computer Science and Engineering',
  'Civil Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Basic Sciences and Humanities',
];

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [department, setDepartment] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let url = `${API}/notices?`;
        if (category !== 'ALL') url += `category=${category}&`;
        if (department !== 'ALL') url += `department=${encodeURIComponent(department)}&`;
        if (search) url += `q=${encodeURIComponent(search)}&`;
        const res = await fetch(url);
        const data = await res.json();
        setNotices(Array.isArray(data) ? data : []);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, category, department]);

  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      {/* Hero */}
      <div className="bg-[#F6C2D3] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#EF83B9] rounded-xl">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A1C1E]">Notice Board</h1>
              <p className="text-sm text-[#4A5568]">Dr. Lankapalli Bullayya College of Engineering</p>
            </div>
          </div>
          <p className="text-sm text-[#1A1C1E] max-w-xl">
            Official announcements, examination notifications, academic updates and important college notices.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 space-y-3 border border-[#E3DFD3]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#4A5568]" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E3DFD3] rounded-lg focus:outline-none focus:border-[#EF83B9] bg-[#F0EEE6] text-[#1A1C1E]"
              placeholder="Search notices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  category === c.value
                    ? 'bg-[#EF83B9] text-white'
                    : 'bg-[#F0EEE6] text-[#1A1C1E] hover:bg-[#F6C2D3]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="text-xs border border-[#E3DFD3] rounded-lg px-3 py-2 bg-white text-[#1A1C1E] focus:outline-none focus:border-[#EF83B9]"
          >
            <option value="ALL">All Departments</option>
            {DEPT_OPTIONS.slice(1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Notice List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-[#E3DFD3] p-5 animate-pulse space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-[#F0EEE6] rounded" />
                  <div className="h-4 w-20 bg-[#F0EEE6] rounded" />
                </div>
                <div className="h-4 bg-[#F0EEE6] rounded w-3/4" />
                <div className="h-3 bg-[#F0EEE6] rounded w-full" />
                <div className="h-3 bg-[#F0EEE6] rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E3DFD3]">
            <Bell className="w-12 h-12 text-[#EF83B9] mx-auto mb-4 opacity-50" />
            <p className="font-bold text-[#1A1C1E]">No notices found</p>
            <p className="text-sm text-[#4A5568] mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(notice => (
              <div
                key={notice.id}
                className={`bg-white rounded-xl border p-5 ${
                  notice.is_urgent ? 'border-[#EF83B9]' : 'border-[#E3DFD3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {notice.is_pinned && (
                        <span className="inline-flex items-center space-x-1 bg-[#9DCD59] text-[#1A1C1E] text-[10px] font-bold px-2 py-0.5 rounded">
                          <Pin className="w-3 h-3" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {notice.is_urgent && (
                        <span className="inline-flex items-center space-x-1 bg-[#EF83B9] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Urgent</span>
                        </span>
                      )}
                      <span className="bg-[#F4B1C8] text-[#1A1C1E] text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                        {notice.category}
                      </span>
                      {notice.department && notice.department !== 'All Departments' && (
                        <span className="bg-[#F0EEE6] text-[#4A5568] text-[10px] font-semibold px-2 py-0.5 rounded">
                          {notice.department}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#1A1C1E] text-sm mb-1">{notice.title}</h3>
                    <p className="text-xs text-[#4A5568] leading-relaxed line-clamp-3">{notice.content}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {notice.published_at && (
                        <span className="text-[11px] text-[#4A5568] flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(notice.published_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                      {notice.attachment_url && (
                        <a
                          href={notice.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#EF83B9] font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Attachment</span>
                        </a>
                      )}
                      {notice.source_url && (
                        <a
                          href={notice.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#EF83B9] font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

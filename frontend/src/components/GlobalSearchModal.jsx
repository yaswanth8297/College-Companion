import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, BookOpen, HelpCircle, X, ArrowRight } from 'lucide-react';
import { searchLocations, getDepartments, getFacilities } from '../services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // Trigger open from parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [locs, depts, facs] = await Promise.all([
          searchLocations(query),
          getDepartments(),
          getFacilities()
        ]);

        const combined = [];

        // Locations
        locs.forEach(l => {
          combined.push({
            type: 'location',
            id: l.id,
            slug: l.slug,
            title: l.name,
            subtitle: `${l.block_name || ''} • ${l.floor_level || ''}`,
            action: `/campus-map?to=${l.slug}`,
            badge: 'Campus Location'
          });
        });

        // Departments
        depts.filter(d => 
          d.name.toLowerCase().includes(query.toLowerCase()) || 
          d.code.toLowerCase().includes(query.toLowerCase())
        ).forEach(d => {
          combined.push({
            type: 'department',
            id: d.id,
            code: d.code,
            title: `Department of ${d.name} (${d.code})`,
            subtitle: d.block_info || 'Engineering Block',
            action: `/departments#${d.code}`,
            badge: 'Department'
          });
        });

        // Facilities
        facs.filter(f => 
          f.name.toLowerCase().includes(query.toLowerCase()) || 
          f.description.toLowerCase().includes(query.toLowerCase())
        ).forEach(f => {
          combined.push({
            type: 'facility',
            id: f.id,
            title: f.name,
            subtitle: f.operating_hours || f.category,
            action: f.location_slug ? `/campus-map?to=${f.location_slug}` : '/facilities',
            badge: 'Facility'
          });
        });

        setResults(combined);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E3DFD3] bg-white">
          <Search className="w-5 h-5 text-[#718096] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campus buildings, departments, labs, canteen..."
            className="w-full bg-transparent text-[#1A1C1E] placeholder-[#718096] focus:outline-hidden text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#718096] hover:text-[#1A1C1E]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs bg-[#E3DFD3] text-[#4A5568] rounded hover:bg-[#D4CEBF]"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-xs text-[#718096]">Searching campus database...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-[#718096]">
              No direct matches found. Try searching for "Library", "Canteen", "Block A", or "Admissions".
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718096] block">
                Quick Campus Destinations
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Central Library', slug: 'library' },
                  { name: 'College Canteen', slug: 'canteen' },
                  { name: 'Block A (CSE & IT)', slug: 'block_a' },
                  { name: 'Administrative Block', slug: 'admin_block' },
                  { name: 'Auditorium', slug: 'auditorium' },
                  { name: 'Sports Complex', slug: 'sports_ground' }
                ].map(item => (
                  <button
                    key={item.slug}
                    onClick={() => {
                      onClose();
                      navigate(`/campus-map?to=${item.slug}`);
                    }}
                    className="p-2 text-left bg-white rounded border border-[#E3DFD3] hover:border-[#EF83B9] flex items-center justify-between text-[#1A1C1E] transition-colors"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#EF83B9]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((res, i) => (
            <button
              key={`${res.type}-${res.id}-${i}`}
              onClick={() => {
                onClose();
                navigate(res.action);
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-white flex items-center justify-between border border-transparent hover:border-[#E3DFD3] transition-colors group mb-1"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-[#F6C2D3]/40 text-[#EF83B9] group-hover:bg-[#EF83B9] group-hover:text-white transition-colors">
                  {res.type === 'location' ? <MapPin className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1C1E]">{res.title}</h4>
                  <p className="text-xs text-[#718096]">{res.subtitle}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E3DFD3] text-[#4A5568]">
                {res.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

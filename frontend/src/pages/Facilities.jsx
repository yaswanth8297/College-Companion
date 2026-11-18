import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Compass, 
  CheckCircle, 
  Coffee, 
  BookOpen, 
  Activity, 
  Users, 
  Heart,
  Car,
  Sparkles
} from 'lucide-react';
import { getFacilities } from '../services/api';

const FACILITY_STYLES = {
  dining: { bg: 'bg-amber-50/50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', iconBg: 'bg-amber-500' },
  academic: { bg: 'bg-cyan-50/50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-800', iconBg: 'bg-cyan-500' },
  sports: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', iconBg: 'bg-emerald-500' },
  amenity: { bg: 'bg-purple-50/50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', iconBg: 'bg-purple-500' },
};

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getFacilities();
        setFacilities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { label: 'All Facilities', value: 'ALL' },
    { label: 'Academic & Research', value: 'academic' },
    { label: 'Dining & Refreshment', value: 'dining' },
    { label: 'Sports & Athletics', value: 'sports' },
    { label: 'Amenities & Healthcare', value: 'amenity' }
  ];

  const filteredFacilities = selectedCategory === 'ALL'
    ? facilities
    : facilities.filter(f => f.category === selectedCategory);

  const getFacilityIcon = (cat) => {
    switch (cat) {
      case 'dining': return Coffee;
      case 'academic': return BookOpen;
      case 'sports': return Activity;
      default: return Building2;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9DCD59]/30 to-[#EF83B9]/30 text-[#1A1C1E] text-xs font-bold border border-[#9DCD59]/40 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-[#2D5A12]" />
            <span>Campus Infrastructure & Student Amenities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1C1E] tracking-tight">
            College Facilities & Resources
          </h1>
          <p className="text-sm text-[#4A5568] max-w-2xl leading-relaxed">
            Discover verified campus facilities, study spaces, health clinic, cafeteria, and athletic grounds with exact walking routes.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-[#EF83B9] to-[#D9529B] text-white shadow-xs scale-102'
                  : 'bg-white text-[#4A5568] border border-[#E3DFD3] hover:bg-[#E3DFD3]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Facilities Grid with Colourful Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => {
            const Icon = getFacilityIcon(fac.category);
            const style = FACILITY_STYLES[fac.category] || FACILITY_STYLES.amenity;
            return (
              <div
                key={fac.id}
                className={`rounded-3xl border ${style.border} ${style.bg} p-6 shadow-xs flex flex-col justify-between hover:border-[#EF83B9] hover:shadow-sm transition-all space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-2xl ${style.iconBg} text-white shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${style.badge}`}>
                      {fac.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#1A1C1E] leading-snug">
                    {fac.name}
                  </h3>

                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    {fac.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#E3DFD3]/80">
                  {/* Hours */}
                  {fac.operating_hours && (
                    <div className="flex items-center text-xs text-[#718096] space-x-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#EF83B9]" />
                      <span>{fac.operating_hours}</span>
                    </div>
                  )}

                  {/* Location & Navigation CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#718096] flex items-center font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#2D5A12]" />
                      <span>{fac.location_name || 'Campus Grounds'}</span>
                    </span>

                    {fac.location_slug && (
                      <button
                        onClick={() => navigate(`/campus-map?to=${fac.location_slug}`)}
                        className="px-4 py-2 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-black text-xs rounded-xl transition-all flex items-center space-x-1 shadow-xs transform hover:scale-102"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

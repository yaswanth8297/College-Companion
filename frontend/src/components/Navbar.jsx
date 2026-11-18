import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Bot, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Menu, 
  X, 
  Search,
  Sparkles
} from 'lucide-react';

export default function Navbar({ onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore College', path: '/explore' },
    { name: 'Campus Map', path: '/campus-map', highlight: true },
    { name: 'Departments', path: '/departments' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Ask Ratna (AI)', path: '/ask-ai', icon: Sparkles, special: true },
    { name: 'Contact & Help', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F0EEE6]/95 backdrop-blur-md border-b border-[#E3DFD3] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Identity */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EF83B9] to-[#D9529B] flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-all">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#1A1C1E] tracking-tight block leading-tight">
                College Companion
              </span>
              <span className="text-xs text-[#718096] block font-medium">
                Dr. Lankapalli Bullayya College
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    active
                      ? 'bg-[#EF83B9] text-white shadow-xs'
                      : link.special
                      ? 'bg-gradient-to-r from-[#EF83B9]/20 to-[#9DCD59]/30 text-[#A21B66] border border-[#EF83B9]/30 hover:shadow-xs'
                      : link.highlight
                      ? 'bg-[#9DCD59]/30 text-[#2D5A12] border border-[#9DCD59]/40 hover:bg-[#9DCD59]/40'
                      : 'text-[#4A5568] hover:text-[#1A1C1E] hover:bg-white/60'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Admin */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#4A5568] hover:text-[#1A1C1E] bg-white hover:bg-[#FBF9F5] rounded-xl transition-all flex items-center space-x-1.5 text-xs font-semibold border border-[#E3DFD3] shadow-2xs"
              title="Search Campus Information (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#EF83B9]" />
              <span>Search</span>
              <kbd className="bg-[#F0EEE6] px-1.5 py-0.5 rounded text-[10px] text-[#718096] border border-[#E3DFD3]">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F6C2D3] hover:bg-[#F4B1C8] text-[#1A1C1E] transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1A1C1E]" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#4A5568] hover:bg-[#E3DFD3] rounded-lg"
            >
              <Search className="w-5 h-5 text-[#EF83B9]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4A5568] hover:bg-[#E3DFD3] rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E3DFD3] bg-[#F0EEE6] px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 ${
                  active
                    ? 'bg-[#EF83B9] text-white shadow-xs'
                    : 'text-[#4A5568] hover:bg-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-[#EF83B9]" />}
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#E3DFD3] mt-2">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold bg-[#F6C2D3] text-[#1A1C1E] text-center shadow-xs"
            >
              Admin Management Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F0EEE6] px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E3DFD3] p-8 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#F6C2D3] text-[#EF83B9] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-[#1A1C1E]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EF83B9]">
            Error 404
          </span>
          <h1 className="text-2xl font-bold text-[#1A1C1E]">
            Lost on Campus?
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            The page or campus destination link you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#EF83B9] hover:bg-[#D9529B] text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/campus-map"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F0EEE6] hover:bg-[#E3DFD3] text-[#1A1C1E] border border-[#E3DFD3] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Open Campus Map</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

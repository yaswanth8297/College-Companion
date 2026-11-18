import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Phone, Mail, Globe, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#EAE7DE] border-t border-[#E3DFD3] text-[#4A5568] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-[#EF83B9] flex items-center justify-center text-white font-bold">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base text-[#1A1C1E]">College Companion</span>
            </div>
            <p className="text-xs text-[#718096] leading-relaxed">
              Dr. Lankapalli Bullayya College of Engineering, Visakhapatnam. Smart campus navigation and verified AI assistant platform.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#9DCD59]/20 rounded text-xs text-[#2D5A12] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#9DCD59]"></span>
              <span>Institution Information Verified</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#1A1C1E] mb-3">Campus</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/campus-map" className="hover:text-[#EF83B9] transition-colors">Interactive Campus Map</Link></li>
              <li><Link to="/campus-map?to=library" className="hover:text-[#EF83B9] transition-colors">Central Library</Link></li>
              <li><Link to="/campus-map?to=canteen" className="hover:text-[#EF83B9] transition-colors">Canteen & Cafeteria</Link></li>
              <li><Link to="/campus-map?to=block_a" className="hover:text-[#EF83B9] transition-colors">Block A (CSE & IT)</Link></li>
              <li><Link to="/campus-map?to=admin_block" className="hover:text-[#EF83B9] transition-colors">Principal & Admin Block</Link></li>
            </ul>
          </div>

          {/* Academics & Admissions */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#1A1C1E] mb-3">Academics</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/departments" className="hover:text-[#EF83B9] transition-colors">All Engineering Departments</Link></li>
              <li><Link to="/admissions" className="hover:text-[#EF83B9] transition-colors">B.Tech Admissions & Eligibility</Link></li>
              <li><Link to="/admissions" className="hover:text-[#EF83B9] transition-colors">EAPCET Code: DLBC</Link></li>
              <li><Link to="/facilities" className="hover:text-[#EF83B9] transition-colors">Laboratories & Computing</Link></li>
              <li><Link to="/ask-ai" className="hover:text-[#EF83B9] transition-colors">Ask Ratna (AI Assistant)</Link></li>
            </ul>
          </div>

          {/* Official Contact */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#1A1C1E] mb-3">College Address</h4>
            <div className="space-y-2 text-xs text-[#4A5568]">
              <p className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#EF83B9] shrink-0 mt-0.5" />
                <span>New Resapuvanipalem, Opp. Swarna Bharathi Indoor Stadium, Visakhapatnam, Andhra Pradesh 530013</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#EF83B9] shrink-0" />
                <span>+91 891 2701819</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#EF83B9] shrink-0" />
                <span>info@bullayyacollege.info</span>
              </p>
              <p className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#EF83B9] shrink-0" />
                <a href="https://www.bullayyacollege.info" target="_blank" rel="noopener noreferrer" className="hover:text-[#EF83B9] underline">
                  bullayyacollege.info
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E3DFD3] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#718096]">
          <p>© {new Date().getFullYear()} Dr. Lankapalli Bullayya College of Engineering. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Link to="/contact" className="hover:text-[#1A1C1E]">Help & Emergency Desk</Link>
            <Link to="/contact#feedback" className="hover:text-[#1A1C1E]">Report Campus Correction</Link>
            <Link to="/admin" className="hover:text-[#1A1C1E]">Staff Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

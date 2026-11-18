import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Award, 
  History, 
  Eye, 
  Target, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle, 
  Compass, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { getCollegeInfo } from '../services/api';

export default function ExploreCollege() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollegeInfo();
        setInfo(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9DCD59]/25 text-[#2D5A12] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Institutional Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1C1E] tracking-tight">
            About Dr. Lankapalli Bullayya College of Engineering
          </h1>
          <p className="text-sm sm:text-base text-[#4A5568] max-w-3xl leading-relaxed">
            {info?.overview || 'Dr. Lankapalli Bullayya College of Engineering is a premier technical institution in Visakhapatnam, offering world-class engineering education and industry-aligned training.'}
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#F6C2D3]/40 text-[#EF83B9] rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1C1E]">Our Vision</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {info?.vision || 'To emerge as a center of excellence in technical education and research, fostering innovative, socially responsible engineers capable of meeting global challenges.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#F6C2D3]/40 text-[#EF83B9] rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1C1E]">Our Mission</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
              {info?.mission || 'To impart quality education through student-centric pedagogical approaches, state-of-the-art laboratories, research initiatives, and strong partnerships with industries and academic institutions.'}
            </p>
          </div>
        </div>

        {/* Institutional History */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD3] space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#F6C2D3]/40 text-[#EF83B9] rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1C1E]">Our History & Founder Legacy</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            {info?.history || 'Established by The Society for Collegiate Education, founded in honor of Dr. Lankapalli Bullayya, former Vice-Chancellor of Andhra University. Over decades, the campus has evolved into one of North Coastal Andhra Pradesh\'s most respected educational hubs.'}
          </p>
          <div className="p-4 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] text-xs text-[#4A5568] space-y-2">
            <p><strong>Affiliation:</strong> {info?.affiliation || 'Affiliated to Andhra University / JNTU-GV'}</p>
            <p><strong>Statutory Approval:</strong> {info?.approval || 'Approved by AICTE, New Delhi'}</p>
            <p><strong>Principal:</strong> {info?.principal_name || 'Dr. G. Deepak'}</p>
            <p><strong>AP EAPCET Counseling Code:</strong> DLBC</p>
          </div>
        </div>

        {/* Campus Overview & CTA to Map */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#1A1C1E]">Explore Campus Landmarks on Interactive Map</h3>
            <p className="text-xs sm:text-sm text-[#4A5568] max-w-xl">
              From the Main Gate to Academic Blocks, Central Library, and Cafeteria, use our graph-powered navigation to find your way effortlessly.
            </p>
          </div>
          <Link
            to="/campus-map"
            className="px-5 py-2.5 bg-[#EF83B9] hover:bg-[#D9529B] text-white font-semibold text-xs rounded-xl transition-colors shrink-0 flex items-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Campus Map</span>
          </Link>
        </div>

        {/* Official Contact Info Box */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD3] space-y-4">
          <h2 className="text-lg font-bold text-[#1A1C1E]">College Communication Desk</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#4A5568]">
            <div className="p-3 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-1">
              <span className="font-semibold text-[#1A1C1E] flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
                Campus Address
              </span>
              <p>{info?.address || 'New Resapuvanipalem'}, {info?.city || 'Visakhapatnam'} - {info?.pincode || '530013'}</p>
            </div>
            <div className="p-3 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-1">
              <span className="font-semibold text-[#1A1C1E] flex items-center">
                <Phone className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
                Phone Number
              </span>
              <p>{info?.phone || '+91 891 2701819'}</p>
            </div>
            <div className="p-3 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-1">
              <span className="font-semibold text-[#1A1C1E] flex items-center">
                <Mail className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
                Email Address
              </span>
              <p>{info?.email || 'info@bullayyacollege.info'}</p>
            </div>
            <div className="p-3 bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] space-y-1">
              <span className="font-semibold text-[#1A1C1E] flex items-center">
                <Globe className="w-3.5 h-3.5 text-[#EF83B9] mr-1" />
                Official Portal
              </span>
              <a href={info?.website || 'https://www.bullayyacollege.info'} target="_blank" rel="noopener noreferrer" className="text-[#EF83B9] underline">
                bullayyacollege.info
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatWidget from './components/FloatingChatWidget';
import GlobalSearchModal from './components/GlobalSearchModal';

// Pages
import Home from './pages/Home';
import ExploreCollege from './pages/ExploreCollege';
import CampusMap from './pages/CampusMap';
import Departments from './pages/Departments';
import Facilities from './pages/Facilities';
import Admissions from './pages/Admissions';
import AskAI from './pages/AskAI';
import ContactHelp from './pages/ContactHelp';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function AdminRouteRedirect() {
  const token = localStorage.getItem('dlbcoe_admin_token');
  return token ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#F0EEE6] text-[#1A1C1E] font-sans antialiased selection:bg-[#EF83B9]/30">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreCollege />} />
            <Route path="/campus-map" element={<CampusMap />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/contact" element={<ContactHelp />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRouteRedirect />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Persistent Floating Chatbot across all views */}
        <FloatingChatWidget />

        {/* Global Instant Search Modal */}
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </Router>
  );
}

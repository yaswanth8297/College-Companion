import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldAlert, 
  Send, 
  CheckCircle, 
  HelpCircle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { submitFeedback } from '../services/api';

export default function ContactHelp() {
  const [feedbackForm, setFeedbackForm] = useState({
    content: '',
    feedback_type: 'general',
    rating: 5,
    email: ''
  });
  const [reportForm, setReportForm] = useState({
    locationName: '',
    description: '',
    email: ''
  });
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.content.trim()) return;
    try {
      await submitFeedback(feedbackForm);
      setFeedbackStatus('Thank you! Your feedback has been recorded.');
      setFeedbackForm({ content: '', feedback_type: 'general', rating: 5, email: '' });
      setTimeout(() => setFeedbackStatus(''), 4000);
    } catch (err) {
      setFeedbackStatus('Error submitting feedback. Please try again.');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;
    try {
      await submitFeedback({
        content: `[Campus Inaccurate Info Report for ${reportForm.locationName || 'General Campus'}]: ${reportForm.description}`,
        feedback_type: 'navigation_correction',
        rating: 1,
        email: reportForm.email
      });
      setReportStatus('Thank you! The campus administration will review and update the coordinates.');
      setReportForm({ locationName: '', description: '', email: '' });
      setTimeout(() => setReportStatus(''), 4000);
    } catch (err) {
      setReportStatus('Error submitting report. Please try again.');
    }
  };

  const emergencyContacts = [
    { title: 'Main Entrance Security Gate', phone: '+91 891 2701819 (Ext: 101)', timing: '24/7 Gate Dispatch' },
    { title: 'Campus Health & Paramedic Post', phone: '+91 891 2701819 (Ext: 105)', timing: '09:00 AM - 05:00 PM' },
    { title: 'Anti-Ragging Squad Helpline', phone: '1800-180-5522 / +91 891 2701820', timing: 'Toll-free 24/7' },
    { title: 'Principal & Administrative Office', phone: '+91 891 2701819', timing: '09:00 AM - 05:00 PM' },
  ];

  const faqs = [
    {
      q: 'Where is Dr. Lankapalli Bullayya College of Engineering situated?',
      a: 'The college is situated in New Resapuvanipalem, opposite Swarna Bharathi Indoor Stadium, in the center of Visakhapatnam, Andhra Pradesh - 530013.'
    },
    {
      q: 'What is the college code for AP EAPCET counseling?',
      a: 'The official counseling code for Dr. Lankapalli Bullayya College of Engineering is DLBC.'
    },
    {
      q: 'How does the campus navigation system calculate routes?',
      a: 'The system uses a graph-based Dijkstra shortest-path algorithm running over verified campus walkways, nodes, and building coordinates. It accounts for actual paved walkways, distance in meters, and wheelchair-accessible ramps.'
    },
    {
      q: 'Can visitors and parents use the navigation map and Ratna AI without logging in?',
      a: 'Yes! The campus map, turn-by-turn directions, department directory, admissions guide, and Ratna (our AI campus companion) are 100% accessible to students, parents, and visitors without any login requirement.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9DCD59]/25 text-[#2D5A12] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Campus Help Desk & Verified Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1C1E] tracking-tight">
            Contact & Campus Help
          </h1>
          <p className="text-sm text-[#4A5568] max-w-2xl leading-relaxed">
            Reach college departments, get immediate emergency contact assistance, submit suggestions, or report any outdated campus signs.
          </p>
        </div>

        {/* Emergency Contacts Section */}
        <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#EF83B9]/20 text-[#EF83B9] rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1C1E]">Campus Emergency & Safety Helpline</h2>
              <p className="text-xs text-[#718096]">Only verified institutional emergency numbers are listed below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {emergencyContacts.map((c, i) => (
              <div key={i} className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-1">
                <h4 className="font-bold text-xs text-[#1A1C1E]">{c.title}</h4>
                <p className="text-xs font-semibold text-[#EF83B9]">{c.phone}</p>
                <span className="text-[10px] text-[#718096] block">{c.timing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Forms: General Feedback + Report Incorrect Campus Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form 1: Feedback */}
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 sm:p-8 shadow-xs space-y-4" id="feedback">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1A1C1E]">Platform Feedback</h3>
              <p className="text-xs text-[#718096]">Share your experience using College Companion.</p>
            </div>

            {feedbackStatus && (
              <div className="p-3 bg-[#9DCD59]/20 text-[#2D5A12] text-xs font-semibold rounded-lg">
                {feedbackStatus}
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Feedback Category</label>
                <select
                  value={feedbackForm.feedback_type}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                >
                  <option value="general">General Experience</option>
                  <option value="navigation">Campus Map Accuracy</option>
                  <option value="chatbot_quality">Ratna (AI Companion) Quality</option>
                  <option value="campus_data">Academic Information</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Your Email (Optional)</label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Comments / Suggestions</label>
                <textarea
                  rows={4}
                  required
                  value={feedbackForm.content}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                  placeholder="Tell us what you liked or how we can improve..."
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#EF83B9] hover:bg-[#D9529B] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>

          {/* Form 2: Report Inaccurate Campus Information */}
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1A1C1E] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Report Campus Correction</span>
              </h3>
              <p className="text-xs text-[#718096]">Notice a room relocated or walkway closed? Let our map administrators know.</p>
            </div>

            {reportStatus && (
              <div className="p-3 bg-[#9DCD59]/20 text-[#2D5A12] text-xs font-semibold rounded-lg">
                {reportStatus}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Building or Facility Name</label>
                <input
                  type="text"
                  required
                  value={reportForm.locationName}
                  onChange={(e) => setReportForm({ ...reportForm, locationName: e.target.value })}
                  placeholder="e.g. CAD/CAM Lab, Block C or Restrooms"
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Your Contact Email</label>
                <input
                  type="email"
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#718096] block mb-1">Description of Correction</label>
                <textarea
                  rows={4}
                  required
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Describe what changed: e.g. Room moved from 1st floor to 2nd floor..."
                  className="w-full px-3 py-2 text-xs bg-[#F0EEE6] rounded-lg border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Submit Campus Correction</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#1A1C1E]">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#E3DFD3] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-[#1A1C1E] hover:bg-[#FBF9F5] flex items-center justify-between transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#718096] transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-[#FBF9F5] text-xs text-[#4A5568] border-t border-[#E3DFD3] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

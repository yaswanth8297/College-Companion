import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Route, 
  Building2, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  AlertCircle, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { 
  logoutAdmin, 
  getLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  getPathways, 
  createPathway, 
  deletePathway,
  getDepartments, 
  createDepartment, 
  toggleDepartmentPublish, 
  deleteDepartment,
  getFacilities, 
  createFacility, 
  deleteFacility,
  getAdminFAQs, 
  createFAQ, 
  deleteFAQ,
  getUnansweredQuestions, 
  convertUnansweredToFAQ, 
  deleteUnansweredQuestion,
  getAdminFeedback, 
  updateFeedbackStatus,
  getCollegeInfo, 
  updateCollegeInfo 
} from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('locations');
  const [locations, setLocations] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Modals / forms
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    category: 'academic',
    latitude: 17.7314,
    longitude: 83.3155,
    block_name: '',
    floor_level: 'Ground Floor',
    description: '',
    accessibility_info: 'Wheelchair accessible'
  });

  const [showPathwayModal, setShowPathwayModal] = useState(false);
  const [newPathway, setNewPathway] = useState({
    from_node_id: '',
    to_node_id: '',
    distance_meters: 50,
    pathway_type: 'walkway',
    instructions_forward: '',
    is_accessible: true
  });

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: 'general',
    question: '',
    answer: '',
    keywords: ''
  });

  const [convertModal, setConvertModal] = useState(null);
  const [convertAnswer, setConvertAnswer] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('dlbcoe_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [locs, paths, depts, facs, faqList, unans, fb, col] = await Promise.all([
        getLocations('', false),
        getPathways(),
        getDepartments(true),
        getFacilities(),
        getAdminFAQs(),
        getUnansweredQuestions(),
        getAdminFeedback(),
        getCollegeInfo()
      ]);
      setLocations(locs);
      setPathways(paths);
      setDepartments(depts);
      setFacilities(facs);
      setFaqs(faqList);
      setUnanswered(unans);
      setFeedback(fb);
      setCollege(col);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) {
        logoutAdmin();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Handlers for Location CRUD
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await createLocation(newLocation);
      setShowLocationModal(false);
      setNewLocation({
        name: '',
        category: 'academic',
        latitude: 17.7314,
        longitude: 83.3155,
        block_name: '',
        floor_level: 'Ground Floor',
        description: '',
        accessibility_info: 'Wheelchair accessible'
      });
      showNotification('Campus location created and routing graph updated.');
      loadAllData();
    } catch (err) {
      alert('Error creating location: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Delete this location and all attached pathways?')) return;
    try {
      await deleteLocation(id);
      showNotification('Location removed.');
      loadAllData();
    } catch (e) {
      alert('Error deleting location');
    }
  };

  // Handlers for Pathways
  const handleCreatePathway = async (e) => {
    e.preventDefault();
    try {
      await createPathway(newPathway);
      setShowPathwayModal(false);
      setNewPathway({
        from_node_id: '',
        to_node_id: '',
        distance_meters: 50,
        pathway_type: 'walkway',
        instructions_forward: '',
        is_accessible: true
      });
      showNotification('New walkway edge connected to the routing engine.');
      loadAllData();
    } catch (err) {
      alert('Error adding pathway: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeletePathway = async (id) => {
    if (!window.confirm('Delete this pathway edge?')) return;
    try {
      await deletePathway(id);
      showNotification('Pathway deleted.');
      loadAllData();
    } catch (e) {
      alert('Error deleting pathway');
    }
  };

  // Handlers for Departments
  const handleTogglePublish = async (id) => {
    try {
      await toggleDepartmentPublish(id);
      showNotification('Department visibility toggled.');
      loadAllData();
    } catch (e) {
      alert('Error toggling publish state');
    }
  };

  // Handlers for FAQs
  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await createFAQ(newFaq);
      setShowFaqModal(false);
      setNewFaq({ category: 'general', question: '', answer: '', keywords: '' });
      showNotification('FAQ created and synced with AI Chatbot knowledge base.');
      loadAllData();
    } catch (e) {
      alert('Error creating FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await deleteFAQ(id);
      showNotification('FAQ deleted.');
      loadAllData();
    } catch (e) {
      alert('Error deleting FAQ');
    }
  };

  // Handlers for Unanswered Questions
  const handleConvertQuestion = async (e) => {
    e.preventDefault();
    if (!convertModal || !convertAnswer.trim()) return;
    try {
      await convertUnansweredToFAQ(convertModal.id, {
        answer: convertAnswer.trim(),
        category: 'general'
      });
      setConvertModal(null);
      setConvertAnswer('');
      showNotification('Unanswered question converted to verified knowledge FAQ.');
      loadAllData();
    } catch (e) {
      alert('Error converting question');
    }
  };

  const handleDeleteUnanswered = async (id) => {
    try {
      await deleteUnansweredQuestion(id);
      loadAllData();
    } catch (e) {
      alert('Error');
    }
  };

  // Handlers for Feedback
  const handleFeedbackStatus = async (id, status) => {
    try {
      await updateFeedbackStatus(id, status);
      showNotification(`Report marked as ${status}.`);
      loadAllData();
    } catch (e) {
      alert('Error updating status');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EEE6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-[#E3DFD3] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6C2D3] text-[#1A1C1E] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#1A1C1E]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1C1E]">
                Campus Content & Navigation Administration
              </h1>
              <p className="text-xs text-[#718096]">
                Dr. Lankapalli Bullayya College of Engineering • Management Panel
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/campus-map')}
              className="px-3 py-1.5 text-xs font-semibold bg-[#F0EEE6] hover:bg-[#E3DFD3] text-[#1A1C1E] rounded-lg transition-colors flex items-center space-x-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Map</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold bg-[#F6C2D3] hover:bg-[#F4B1C8] text-[#1A1C1E] rounded-lg transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMsg && (
          <div className="p-3 bg-[#9DCD59]/25 text-[#2D5A12] text-xs font-bold rounded-xl border border-[#9DCD59]/40 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-[#2D5A12]" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E3DFD3] pb-3">
          {[
            { id: 'locations', label: `Locations (${locations.length})`, icon: MapPin },
            { id: 'pathways', label: `Pathways (${pathways.length})`, icon: Route },
            { id: 'departments', label: `Departments (${departments.length})`, icon: Building2 },
            { id: 'facilities', label: `Facilities (${facilities.length})`, icon: BookOpen },
            { id: 'faqs', label: `Knowledge Base (${faqs.length})`, icon: HelpCircle },
            { id: 'unanswered', label: `Unanswered Queries (${unanswered.length})`, icon: MessageSquare, badge: unanswered.length > 0 },
            { id: 'feedback', label: `Campus Reports (${feedback.length})`, icon: AlertCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#EF83B9] text-white shadow-xs'
                    : 'bg-white text-[#4A5568] border border-[#E3DFD3] hover:bg-[#E3DFD3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CAMPUS LOCATIONS (GRAPH NODES) */}
        {activeTab === 'locations' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#1A1C1E]">Campus Building Nodes</h2>
                <p className="text-xs text-[#718096]">Coordinates and landmarks used by the Dijkstra routing graph.</p>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-3 py-2 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-xl flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Location</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0EEE6] text-[#1A1C1E] font-bold">
                  <tr>
                    <th className="p-3">ID / Slug</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Coordinates (Lat, Lng)</th>
                    <th className="p-3">Block / Floor</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DFD3]">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-[#FBF9F5]">
                      <td className="p-3 font-mono text-[11px] text-[#718096]">{loc.slug}</td>
                      <td className="p-3 font-semibold text-[#1A1C1E]">{loc.name}</td>
                      <td className="p-3 capitalize">{loc.category}</td>
                      <td className="p-3 font-mono text-[11px]">{loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}</td>
                      <td className="p-3 text-[#718096]">{loc.block_name} ({loc.floor_level})</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PATHWAYS & EDGES */}
        {activeTab === 'pathways' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#1A1C1E]">Campus Pathways & Walkway Edges</h2>
                <p className="text-xs text-[#718096]">Connections between nodes with physical walking distances.</p>
              </div>
              <button
                onClick={() => setShowPathwayModal(true)}
                className="px-3 py-2 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-xl flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pathway</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0EEE6] text-[#1A1C1E] font-bold">
                  <tr>
                    <th className="p-3">From Node</th>
                    <th className="p-3">To Node</th>
                    <th className="p-3">Distance</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Step-Free</th>
                    <th className="p-3">Forward Instructions</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DFD3]">
                  {pathways.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FBF9F5]">
                      <td className="p-3 font-semibold text-[#1A1C1E]">{p.from_node_name}</td>
                      <td className="p-3 font-semibold text-[#1A1C1E]">{p.to_node_name}</td>
                      <td className="p-3 font-mono">{p.distance_meters} m</td>
                      <td className="p-3 capitalize">{p.pathway_type}</td>
                      <td className="p-3">
                        {p.is_accessible ? (
                          <span className="text-[#2D5A12] font-semibold">Yes</span>
                        ) : (
                          <span className="text-red-500 font-semibold">Stairs</span>
                        )}
                      </td>
                      <td className="p-3 text-[#718096] max-w-xs truncate">{p.instructions_forward || '—'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeletePathway(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Pathway"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#1A1C1E]">Engineering Departments</h2>
            <div className="space-y-3">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#EF83B9] bg-[#F6C2D3]/30 px-2 py-0.5 rounded">
                        {d.code}
                      </span>
                      <h3 className="font-bold text-sm text-[#1A1C1E]">{d.name}</h3>
                    </div>
                    <p className="text-xs text-[#718096] mt-1">
                      HOD: {d.head_of_department} • Block: {d.block_info} • Intake: {d.student_intake}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePublish(d.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                        d.is_published
                          ? 'bg-[#9DCD59]/30 text-[#2D5A12]'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {d.is_published ? <Eye className="w-3.5 h-3.5 mr-1" /> : <EyeOff className="w-3.5 h-3.5 mr-1" />}
                      <span>{d.is_published ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#1A1C1E]">Campus Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facilities.map((f) => (
                <div key={f.id} className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-[#1A1C1E]">{f.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-[#718096] bg-[#E3DFD3] px-2 py-0.5 rounded">
                      {f.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A5568]">{f.description}</p>
                  <p className="text-[11px] text-[#718096] pt-1">Hours: {f.operating_hours || 'Regular'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: KNOWLEDGE BASE / FAQS */}
        {activeTab === 'faqs' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#1A1C1E]">AI Knowledge Base & FAQs</h2>
                <p className="text-xs text-[#718096]">Information indexed and retrieved by the chatbot.</p>
              </div>
              <button
                onClick={() => setShowFaqModal(true)}
                className="px-3 py-2 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-xl flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ Entry</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#EF83B9] bg-[#F6C2D3]/30 px-2 py-0.5 rounded">
                      {f.category}
                    </span>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-xs text-[#1A1C1E]">Q: {f.question}</h4>
                  <p className="text-xs text-[#4A5568] leading-relaxed">A: {f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: UNANSWERED CHATBOT QUESTIONS */}
        {activeTab === 'unanswered' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#1A1C1E]">Chatbot Unanswered Inquiries</h2>
              <p className="text-xs text-[#718096]">
                Questions asked by campus visitors for which no verified knowledge existed. Convert them to verified FAQs to train the bot.
              </p>
            </div>

            {unanswered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">
                All visitor queries are currently answered by the knowledge base!
              </div>
            ) : (
              <div className="space-y-3">
                {unanswered.map((u) => (
                  <div key={u.id} className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-[#1A1C1E]">"{u.question}"</h4>
                      <span className="text-[11px] text-[#718096]">
                        Asked {u.frequency} time(s) • Status: {u.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setConvertModal(u);
                          setConvertAnswer('');
                        }}
                        className="px-3 py-1.5 bg-[#9DCD59] hover:bg-[#8ABF44] text-[#1A1C1E] font-bold text-xs rounded-lg shadow-xs"
                      >
                        Convert to FAQ
                      </button>
                      <button
                        onClick={() => handleDeleteUnanswered(u.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FEEDBACK & CORRECTION REPORTS */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-2xl border border-[#E3DFD3] p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#1A1C1E]">User Feedback & Campus Correction Reports</h2>
            {feedback.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No reports submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#718096] bg-[#E3DFD3] px-2 py-0.5 rounded">
                        {item.feedback_type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'resolved' ? 'bg-[#9DCD59]/30 text-[#2D5A12]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1C1E] leading-relaxed">{item.content}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#718096]">
                      <span>Contact: {item.contact_email || 'Anonymous'}</span>
                      {item.status !== 'resolved' && (
                        <button
                          onClick={() => handleFeedbackStatus(item.id, 'resolved')}
                          className="px-2.5 py-1 bg-[#9DCD59] text-[#1A1C1E] font-bold rounded"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD LOCATION */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-[#E3DFD3] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1A1C1E]">Add Campus Building Node</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-[#718096]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Building / Destination Name</label>
                <input
                  type="text"
                  required
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g. Block D - Innovation Center"
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newLocation.category}
                    onChange={(e) => setNewLocation({ ...newLocation, category: e.target.value })}
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  >
                    <option value="academic">Academic</option>
                    <option value="admin">Administrative</option>
                    <option value="facility">Facility</option>
                    <option value="lab">Laboratory</option>
                    <option value="sports">Sports</option>
                    <option value="parking">Parking</option>
                    <option value="amenity">Amenity</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Floor Level</label>
                  <input
                    type="text"
                    value={newLocation.floor_level}
                    onChange={(e) => setNewLocation({ ...newLocation, floor_level: e.target.value })}
                    placeholder="Ground Floor"
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={newLocation.latitude}
                    onChange={(e) => setNewLocation({ ...newLocation, latitude: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={newLocation.longitude}
                    onChange={(e) => setNewLocation({ ...newLocation, longitude: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Block Name</label>
                <input
                  type="text"
                  value={newLocation.block_name}
                  onChange={(e) => setNewLocation({ ...newLocation, block_name: e.target.value })}
                  placeholder="Block D"
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                  placeholder="Details..."
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-3 py-2 bg-[#E3DFD3] rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EF83B9] text-white rounded-lg font-bold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PATHWAY */}
      {showPathwayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-[#E3DFD3] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1A1C1E]">Add Campus Walkway Edge</h3>
              <button onClick={() => setShowPathwayModal(false)} className="text-[#718096]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePathway} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">From Node</label>
                  <select
                    required
                    value={newPathway.from_node_id}
                    onChange={(e) => setNewPathway({ ...newPathway, from_node_id: e.target.value })}
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  >
                    <option value="">Select Origin...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">To Node</label>
                  <select
                    required
                    value={newPathway.to_node_id}
                    onChange={(e) => setNewPathway({ ...newPathway, to_node_id: e.target.value })}
                    className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                  >
                    <option value="">Select Destination...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Distance (Meters)</label>
                <input
                  type="number"
                  required
                  value={newPathway.distance_meters}
                  onChange={(e) => setNewPathway({ ...newPathway, distance_meters: parseFloat(e.target.value) })}
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Walking Instructions</label>
                <input
                  type="text"
                  value={newPathway.instructions_forward}
                  onChange={(e) => setNewPathway({ ...newPathway, instructions_forward: e.target.value })}
                  placeholder="e.g. Walk along the shaded path past the trees"
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acc_cb"
                  checked={newPathway.is_accessible}
                  onChange={(e) => setNewPathway({ ...newPathway, is_accessible: e.target.checked })}
                />
                <label htmlFor="acc_cb">Step-free wheelchair accessible</label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPathwayModal(false)}
                  className="px-3 py-2 bg-[#E3DFD3] rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9DCD59] text-[#1A1C1E] rounded-lg font-bold"
                >
                  Add Pathway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FAQ */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-[#E3DFD3] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1A1C1E]">Add FAQ Knowledge Entry</h3>
              <button onClick={() => setShowFaqModal(false)} className="text-[#718096]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={newFaq.category}
                  onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                >
                  <option value="general">General</option>
                  <option value="academics">Academics</option>
                  <option value="admissions">Admissions</option>
                  <option value="navigation">Navigation</option>
                  <option value="facilities">Facilities</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="e.g. What are the college canteen timings?"
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Verified answer..."
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={newFaq.keywords}
                  onChange={(e) => setNewFaq({ ...newFaq, keywords: e.target.value })}
                  placeholder="canteen, breakfast, lunch, timings"
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-3 py-2 bg-[#E3DFD3] rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EF83B9] text-white rounded-lg font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONVERT UNANSWERED TO FAQ */}
      {convertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-[#E3DFD3] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1A1C1E]">Convert Visitor Inquiry to FAQ</h3>
              <button onClick={() => setConvertModal(null)} className="text-[#718096]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConvertQuestion} className="space-y-3 text-xs">
              <div className="p-3 bg-[#F0EEE6] rounded-lg">
                <span className="text-[#718096] block text-[11px]">Visitor's Question:</span>
                <span className="font-bold text-sm text-[#1A1C1E]">"{convertModal.question}"</span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Verified Official Answer</label>
                <textarea
                  rows={4}
                  required
                  value={convertAnswer}
                  onChange={(e) => setConvertAnswer(e.target.value)}
                  placeholder="Provide the accurate answer for the AI chatbot to use..."
                  className="w-full p-2 bg-[#F0EEE6] rounded-lg border border-[#E3DFD3]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertModal(null)}
                  className="px-3 py-2 bg-[#E3DFD3] rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9DCD59] text-[#1A1C1E] rounded-lg font-bold"
                >
                  Save & Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import axios from 'axios';

// Allows overriding API Base URL via VITE_API_BASE_URL (for Vercel deployment with external or serverless backend)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = rawBaseUrl ? `${rawBaseUrl.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dlbcoe_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const loginAdmin = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  if (res.data.access_token) {
    localStorage.setItem('dlbcoe_admin_token', res.data.access_token);
    localStorage.setItem('dlbcoe_admin_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem('dlbcoe_admin_token');
  localStorage.removeItem('dlbcoe_admin_user');
};

export const getAdminProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

// College Info
export const getCollegeInfo = async () => {
  const res = await api.get('/college');
  return res.data;
};

export const getDepartments = async (all = false) => {
  const res = await api.get(`/departments${all ? '?all=true' : ''}`);
  return res.data;
};

export const getDepartment = async (idOrCode) => {
  const res = await api.get(`/departments/${idOrCode}`);
  return res.data;
};

export const getFacilities = async (category = '') => {
  const url = category ? `/facilities?category=${encodeURIComponent(category)}` : '/facilities';
  const res = await api.get(url);
  return res.data;
};

export const getAdmissions = async () => {
  const res = await api.get('/admissions');
  return res.data;
};

// Navigation
export const getLocations = async (category = '', destinationsOnly = false) => {
  let url = '/locations?';
  if (category) url += `category=${encodeURIComponent(category)}&`;
  if (destinationsOnly) url += 'destinations_only=true&';
  const res = await api.get(url);
  return res.data;
};

export const getLocation = async (id) => {
  const res = await api.get(`/locations/${id}`);
  return res.data;
};

export const searchLocations = async (query) => {
  const res = await api.get(`/locations/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const calculateRoute = async (originId, destinationId, wheelchairOnly = false) => {
  const res = await api.post('/navigation/route', {
    origin_id: originId,
    destination_id: destinationId,
    wheelchair_only: wheelchairOnly,
  });
  return res.data;
};

export const getPathways = async () => {
  const res = await api.get('/navigation/pathways');
  return res.data;
};

// Chatbot
export const sendChatMessage = async (message, sessionId) => {
  const res = await api.post('/chat', { message, session_id: sessionId });
  return res.data;
};

export const getChatHistory = async (sessionId) => {
  const res = await api.get(`/chat/history?session_id=${encodeURIComponent(sessionId)}`);
  return res.data;
};

export const submitFeedback = async (data) => {
  const res = await api.post('/chat/feedback', data);
  return res.data;
};

export const getChatSuggestions = async () => {
  const res = await api.get('/chat/suggestions');
  return res.data;
};

// Admin CRUD
export const updateCollegeInfo = async (data) => {
  const res = await api.put('/admin/college', data);
  return res.data;
};

export const createLocation = async (data) => {
  const res = await api.post('/admin/locations', data);
  return res.data;
};

export const updateLocation = async (id, data) => {
  const res = await api.put(`/admin/locations/${id}`, data);
  return res.data;
};

export const deleteLocation = async (id) => {
  const res = await api.delete(`/admin/locations/${id}`);
  return res.data;
};

export const createPathway = async (data) => {
  const res = await api.post('/admin/pathways', data);
  return res.data;
};

export const updatePathway = async (id, data) => {
  const res = await api.put(`/admin/pathways/${id}`, data);
  return res.data;
};

export const deletePathway = async (id) => {
  const res = await api.delete(`/admin/pathways/${id}`);
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await api.post('/admin/departments', data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await api.put(`/admin/departments/${id}`, data);
  return res.data;
};

export const toggleDepartmentPublish = async (id) => {
  const res = await api.patch(`/admin/departments/${id}/toggle-publish`);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/admin/departments/${id}`);
  return res.data;
};

export const createFacility = async (data) => {
  const res = await api.post('/admin/facilities', data);
  return res.data;
};

export const updateFacility = async (id, data) => {
  const res = await api.put(`/admin/facilities/${id}`, data);
  return res.data;
};

export const deleteFacility = async (id) => {
  const res = await api.delete(`/admin/facilities/${id}`);
  return res.data;
};

export const getAdminFAQs = async () => {
  const res = await api.get('/admin/faqs');
  return res.data;
};

export const createFAQ = async (data) => {
  const res = await api.post('/admin/faqs', data);
  return res.data;
};

export const updateFAQ = async (id, data) => {
  const res = await api.put(`/admin/faqs/${id}`, data);
  return res.data;
};

export const deleteFAQ = async (id) => {
  const res = await api.delete(`/admin/faqs/${id}`);
  return res.data;
};

export const getUnansweredQuestions = async () => {
  const res = await api.get('/admin/unanswered-questions');
  return res.data;
};

export const convertUnansweredToFAQ = async (id, data) => {
  const res = await api.post(`/admin/unanswered-questions/${id}/convert-to-faq`, data);
  return res.data;
};

export const deleteUnansweredQuestion = async (id) => {
  const res = await api.delete(`/admin/unanswered-questions/${id}`);
  return res.data;
};

export const getAdminFeedback = async () => {
  const res = await api.get('/admin/feedback');
  return res.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const res = await api.patch(`/admin/feedback/${id}/status`, { status });
  return res.data;
};

export default api;

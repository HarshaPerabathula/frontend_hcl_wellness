import axios from 'axios';
import { User, WellnessGoal, DashboardData, PreventiveCare } from '../types';

const API_BASE_URL = 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  giveConsent: () => api.post('/users/give-consent'),
};

export const patientAPI = {
  logProgress: (data: { goalId: string; date: string; actualValue: number }) => 
    api.post('/patients/log-progress', data),
  getActiveGoals: () => api.get('/patients/active-goals'),
  getDashboard: () => api.get('/patients/dashboard'),
  getProgressHistory: (params?: any) => api.get('/patients/progress-history', { params }),
  getStreaks: () => api.get('/patients/streaks'),
};

export const providerAPI = {
  assignGoal: (goalData: any) => api.post('/providers/assign-goals', goalData),
  getPatients: () => api.get('/providers/patients'),
  getPatientGoals: (patientId: string) => api.get(`/providers/patients/${patientId}/goals`),
  modifyGoal: (goalId: string, data: any) => api.put(`/providers/goals/${goalId}/modify`, data),
  deleteGoal: (goalId: string) => api.delete(`/providers/goals/${goalId}`),
};

export const preventiveCareAPI = {
  getSchedule: () => api.get('/preventive-care/schedule'),
  bookCheckup: (data: any) => api.post('/preventive-care/book', data),
  markCompleted: (id: string, data: any) => api.put(`/preventive-care/${id}/complete`, data),
  getOverdue: () => api.get('/preventive-care/overdue'),
  reschedule: (data: any) => api.post('/preventive-care/reschedule', data),
};
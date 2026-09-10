import { create } from 'zustand';
import api from '../api/client';

const DEMO_ACCOUNTS = {
  citizen: { email: 'citizen@nlams.gov.in', password: 'citizen123', label: 'Citizen / Landowner' },
  field_officer: { email: 'field@nlams.gov.in', password: 'field123', label: 'Field Survey Officer' },
  district_official: { email: 'district@nlams.gov.in', password: 'district123', label: 'District Magistrate / Collector' },
  state_official: { email: 'state@nlams.gov.in', password: 'state123', label: 'State Revenue Department' },
  ministry_official: { email: 'ministry@nlams.gov.in', password: 'ministry123', label: 'Central Ministry (MoRD)' }
};

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nlams_user') || 'null'),
  token: localStorage.getItem('nlams_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('nlams_token', token);
      localStorage.setItem('nlams_user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please check credentials.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      const { token, user } = res.data;
      localStorage.setItem('nlams_token', token);
      localStorage.setItem('nlams_user', JSON.stringify(user));
      set({ token, user, isLoading: false, error: null });
      return { success: true, user, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please verify statutory details.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  quickLogin: async (roleKey) => {
    const creds = DEMO_ACCOUNTS[roleKey];
    if (!creds) return;
    return get().login(creds.email, creds.password);
  },

  logout: () => {
    localStorage.removeItem('nlams_token');
    localStorage.removeItem('nlams_user');
    set({ user: null, token: null, error: null });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user });
      localStorage.setItem('nlams_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
  }
}));

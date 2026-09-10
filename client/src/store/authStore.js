import { create } from 'zustand';
import api from '../api/client';

const DEMO_ACCOUNTS = {
  citizen: { email: 'citizen@nlams.gov.in', password: 'citizen123', label: 'Citizen / Landowner', role: 'citizen' },
  field_officer: { email: 'field@nlams.gov.in', password: 'field123', label: 'Field Survey Officer', role: 'field_officer' },
  district_official: { email: 'district@nlams.gov.in', password: 'district123', label: 'District Magistrate / Collector', role: 'district_official' },
  state_official: { email: 'state@nlams.gov.in', password: 'state123', label: 'State Revenue Department', role: 'state_official' },
  ministry_official: { email: 'ministry@nlams.gov.in', password: 'ministry123', label: 'Central Ministry (MoRD)', role: 'ministry_official' }
};

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('nlams_user') || 'null'),
  token: localStorage.getItem('nlams_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password, role) => {
    // 1. Validation checks for empty fields
    if (!email || !email.trim()) {
      const msg = 'Please enter your official email or identity ID.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
    if (!password || !password.trim()) {
      const msg = 'Please enter your security passcode.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }

    set({ isLoading: true, error: null });
    try {
      const payload = { email: email.trim(), password };
      if (role) payload.role = role;

      const res = await api.post('/auth/login', payload);
      const { token, user } = res.data;
      localStorage.setItem('nlams_token', token);
      localStorage.setItem('nlams_user', JSON.stringify(user));
      set({ token, user, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      let msg = 'Something went wrong during authentication.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (!err.response) {
        msg = 'Authentication service is unavailable. Please try again.';
      }
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
    return get().login(creds.email, creds.password, roleKey);
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
  },

  clearError: () => set({ error: null })
}));

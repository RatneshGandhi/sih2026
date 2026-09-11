import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '') : '';

export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return backendUrl ? `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}` : path;
};

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nlams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('nlams_token');
        localStorage.removeItem('nlams_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

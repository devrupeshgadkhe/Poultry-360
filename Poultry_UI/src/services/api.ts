import axios from 'axios';

const api = axios.create({
  // Use a relative path so the Vite proxy (vite.config.ts) handles the routing
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
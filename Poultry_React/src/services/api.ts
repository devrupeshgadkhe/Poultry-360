import axios, { AxiosError } from 'axios';

/**
 * Poultry 360 ERP - API Configuration
 * ✅ JWT Token Injection
 * ✅ 401 → Auto Logout & Redirect to Login
 * ✅ No alert() popups (console logs only)
 */

const api = axios.create({
  baseURL: 'https://localhost:56700/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/* =========================
   🔐 REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('🚀 API REQUEST:', config.method?.toUpperCase(), config.baseURL + config.url);

      return config;
    } catch (err) {
      console.error('❌ REQUEST INTERCEPTOR ERROR:', err);
      return Promise.reject(err);
    }
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

/* =========================
   📥 RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    // ❌ Network Error - Server बंद आहे
    if (!error.response) {
      console.error('❌ NETWORK ERROR - Server reachable नाही:', error.message);
      // ✅ alert() काढला - crash होत होता
      return Promise.reject(error);
    }

    const { status, data, config } = error.response;
    console.error(`🔥 API ERROR: ${status}`, config?.url, data);

    switch (status) {
      case 400:
        console.error('❌ Bad Request (400)');
        break;

      case 401:
        // ✅ Token expired/invalid → Logout करून Login वर पाठवा
        console.error('🚨 401 Unauthorized - Token invalid, logging out');
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;

      case 403:
        console.error('❌ Forbidden (403)');
        break;

      case 404:
        console.error('❌ API Not Found (404):', config?.url);
        break;

      case 500:
        console.error('❌ Server Error (500)');
        break;

      default:
        console.error(`❌ Unexpected Error: ${status}`);
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
import axios, { AxiosError } from 'axios';

/**
 * Poultry 360 ERP - API Configuration
 * ✅ JWT Token Injection
 * ✅ Full Debug Logs
 * ❌ NO Auto Redirect on 401 (Important Fix)
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

      // 🔐 Attach token
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 🔍 Debug Logs
      console.log('🚀 API REQUEST');
      console.log('➡️ URL:', config.baseURL + config.url);
      console.log('➡️ Method:', config.method?.toUpperCase());
      console.log('➡️ Token:', token);
      console.log('➡️ Data:', config.data || null);

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
    try {
      console.log('✅ API RESPONSE');
      console.log('⬅️ URL:', response.config.url);
      console.log('⬅️ Status:', response.status);
      console.log('⬅️ Data:', response.data);

      return response;
    } catch (err) {
      console.error('❌ RESPONSE PARSE ERROR:', err);
      return Promise.reject(err);
    }
  },
  (error: AxiosError) => {
    console.error('🔥 API ERROR START 🔥');

    // ❌ Network Error
    if (!error.response) {
      console.error('❌ NETWORK ERROR');
      console.error('Message:', error.message);
      alert('Server not reachable');
      console.error('🔥 API ERROR END 🔥');
      return Promise.reject(error);
    }

    const { status, data, config } = error.response;

    console.error('➡️ URL:', config?.url);
    console.error('➡️ Status:', status);
    console.error('➡️ Response:', data);

    /* =========================
       🎯 STATUS HANDLING
    ========================= */

    switch (status) {
      case 400:
        alert('Bad Request (400)');
        break;

      case 401:
        // 🔥 MAIN FIX: NO REDIRECT
        console.error('🚨 401 Unauthorized - NOT redirecting');
        console.error('👉 Check token / backend auth logic');
        break;

      case 403:
        alert('Forbidden (403)');
        break;

      case 404:
        alert('API Not Found (404)');
        break;

      case 500:
        alert('Server Error (500)');
        break;

      default:
        console.error(`Unexpected Error: ${status}`);
        break;
    }

    console.error('🔥 API ERROR END 🔥');

    return Promise.reject(error);
  }
);

export default api;
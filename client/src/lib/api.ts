// client/src/lib/api.ts

import axios from 'axios';

// 1. Create the Axios Instance
// We point to our backend URL (hardcoded for dev, env variable for prod)
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (The "Outgoing" Gatekeeper)
// Automatically attaches the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // We will store the token in localStorage with the key 'token'
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (The "Incoming" Watchdog)
// Catches 401/403 errors globally to force a logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a security violation
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // Prevent redirect loop if already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Force redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
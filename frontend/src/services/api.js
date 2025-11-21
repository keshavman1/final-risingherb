// frontend/src/services/api.js
import axios from 'axios';

// Use Vite env var VITE_API_URL (set in .env or Vercel).
// Fallback to localhost for local dev.
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_BASE = rawBase.replace(/\/$/, ''); // remove trailing slash if present

const api = axios.create({
  baseURL: API_BASE,
  // include credentials if you're using cookie auth; change if not needed
  // withCredentials: true,
});

// allow setting token from auth context
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;

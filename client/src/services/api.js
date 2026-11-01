/**
 * Dynamic API Base URL configuration
 * Supports:
 * 1. Docker Nginx Container (Port 3000 / 80) via reverse proxy (/api)
 * 2. Vite Local Development (Port 5173) via Vite proxy (/api)
 * 3. Fallback direct Express endpoint (http://localhost:5000/api)
 */
const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000' || window.location.port === '80' || window.location.port === '')
    ? '/api'
    : 'http://localhost:5000/api');

export default API_BASE;


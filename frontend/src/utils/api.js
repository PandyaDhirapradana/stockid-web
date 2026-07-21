import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const currentPath = window.location.pathname;

  // Route yang SELALU pakai admin token
  const forceAdminToken =
    url.startsWith('/members') ||
    url.startsWith('/transactions') ||
    url.startsWith('/admin') ||
    url.startsWith('/auth/login') ||
    url.startsWith('/auth/me') ||
    url.startsWith('/auth/forgot') ||
    url.startsWith('/auth/reset') ||
    url.startsWith('/content/reviews/all') ||
    url.startsWith('/content/gain-photos/all') ||
    url.startsWith('/content/mentors/all') ||
    (url.startsWith('/content/site') && method !== 'get') ||
    (url.startsWith('/content/reviews') && method !== 'get') ||
    (url.startsWith('/content/gain-photos') && method !== 'get') ||
    (url.startsWith('/content/mentors') && method !== 'get') ||
    (url.startsWith('/modules') && method !== 'get') || 
    url.startsWith('/modules/all') ||
    (url.startsWith('/content/site/slider') && method !== 'get')||
    url.startsWith('/payment/dev/');

  // Leaderboard: kirim token sesuai halaman yang sedang dibuka
  // Jika sedang di halaman admin, pakai admin token
  // Jika sedang di halaman member/user, pakai user token
  const isLeaderboard = url.startsWith('/leaderboard');
  const isOnAdminPage = currentPath.startsWith('/admin');

  if (forceAdminToken && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (isLeaderboard) {
    // Prioritaskan konteks halaman
    if (isOnAdminPage && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/admin') && !path.includes('/login')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
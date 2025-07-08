// frontend/src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:3000', // adjust if needed
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  // const token = Cookies.get('token');
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

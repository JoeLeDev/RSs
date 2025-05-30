import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // ← remplace par ton vrai backend si besoin
});

// Attache le token automatiquement si présent
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

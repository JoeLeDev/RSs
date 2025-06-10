import axios from 'axios';
import { auth } from '../Firebase';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // ← remplace par ton vrai backend si besoin
});

// Attache le token Firebase automatiquement
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

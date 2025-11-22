// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // tu backend o puedes usar datos simulados
  headers: { 'Content-Type': 'application/json' },
});

export default api;

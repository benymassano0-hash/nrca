import axios from 'axios';

const getRuntimeApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:5000/api';
  }

  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLanIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  // Em desenvolvimento local (PC ou telemóvel na mesma rede), a API corre na porta 5000.
  if (isLocalHost || isLanIp) {
    return `${protocol}//${hostname}:5000/api`;
  }

  // Em produção com domínio, preferir mesma origem.
  return '/api';
};

const API_URL = process.env.REACT_APP_API_URL || getRuntimeApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': '1',
  },
});

// Adicionar token ao header se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

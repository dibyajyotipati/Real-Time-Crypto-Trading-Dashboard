import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
};

// Market
export const marketAPI = {
  getPrices: () => api.get('/market/prices'),
  getPrice: (symbol) => api.get(`/market/price/${symbol}`),
  getHistory: (symbol, interval = '1h', limit = 100) =>
    api.get(`/market/history/${symbol}?interval=${interval}&limit=${limit}`)
};

// Trades
export const tradesAPI = {
  buy: (symbol, quantity) => api.post('/trades/buy', { symbol, quantity }),
  sell: (symbol, quantity) => api.post('/trades/sell', { symbol, quantity }),
  getHistory: (params = {}) => api.get('/trades/history', { params })
};

// Portfolio
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  getBalance: () => api.get('/portfolio/balance')
};

// AI
export const aiAPI = {
  getSignal: (symbol) => api.get(`/ai/signal/${symbol}`)
};

export default api;

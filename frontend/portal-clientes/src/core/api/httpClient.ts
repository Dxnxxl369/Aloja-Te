import axios from 'axios';
import { API_BASE_URL } from './apiEndpoints';
import { TokenStorage } from '../auth/TokenStorage';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[HTTP Client] Sesión expirada o token no válido.');
    }
    return Promise.reject(error);
  }
);

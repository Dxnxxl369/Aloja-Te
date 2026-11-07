import axios from 'axios';
import { API_BASE_URL } from './apiEndpoints';

let ssoMemoryToken: string | null = null;

export const setSSOToken = (token: string | null) => {
  ssoMemoryToken = token;
};

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    if (ssoMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${ssoMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

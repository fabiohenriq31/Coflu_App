import axios from 'axios';

import { authToken } from './auth-token';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authToken.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Nao foi possivel conectar ao Coflu.';
  }

  return 'Algo deu errado. Tente novamente.';
};

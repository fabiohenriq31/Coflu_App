import axios from 'axios';
import Constants from 'expo-constants';

import { authToken } from './auth-token';

const getExpoHostApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];

  return host ? `http://${host}:3333` : null;
};

const getApiBaseUrls = () => {
  const urls = [process.env.EXPO_PUBLIC_API_URL, getExpoHostApiUrl(), 'http://10.0.2.2:3333']
    .filter((url): url is string => Boolean(url))
    .map((url) => url.replace(/\/$/, ''));

  return [...new Set(urls)];
};

const API_URLS = getApiBaseUrls();
const API_URL = API_URLS[0] ?? 'http://localhost:3333';

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
  async (error) => {
    const config = error.config;

    if (!error.response && config && !config.__cofluRetriedWithFallback) {
      const currentBaseUrl = (config.baseURL ?? API_URL).replace(/\/$/, '');
      const fallbackUrl = API_URLS.find((url) => url !== currentBaseUrl);

      if (fallbackUrl) {
        config.__cofluRetriedWithFallback = true;
        config.baseURL = fallbackUrl;

        return api.request(config);
      }
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Nao foi possivel conectar ao Coflu.';
  }

  return 'Algo deu errado. Tente novamente.';
};

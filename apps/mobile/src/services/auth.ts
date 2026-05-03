import { api } from './api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'system';
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<AuthResponse>('/auth/login', payload);

    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await api.post<AuthResponse>('/auth/register', payload);

    return response.data;
  },

  async me() {
    const response = await api.get<{ user: AuthUser }>('/auth/me');

    return response.data.user;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};

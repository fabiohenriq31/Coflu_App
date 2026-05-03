import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  authService,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../services/auth';
import { authToken } from '../services/auth-token';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setHydrated: (isHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: false,
      isAuthenticated: false,

      async login(payload) {
        set({ isLoading: true });

        try {
          const response = await authService.login(payload);

          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
          });
          authToken.set(response.accessToken);
        } finally {
          set({ isLoading: false });
        }
      },

      async register(payload) {
        set({ isLoading: true });

        try {
          const response = await authService.register(payload);

          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
          });
          authToken.set(response.accessToken);
        } finally {
          set({ isLoading: false });
        }
      },

      async logout() {
        const token = get().token;

        if (token) {
          try {
            await authService.logout();
          } catch {
            // Stateless logout: local cleanup is enough if the network request fails.
          }
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        authToken.set(null);
      },

      async restoreSession() {
        const token = get().token;
        authToken.set(token);

        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const user = await authService.me();

          set({
            user,
            isAuthenticated: true,
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          authToken.set(null);
        }
      },

      setHydrated(isHydrated) {
        set({ isHydrated });
      },
    }),
    {
      name: 'coflu-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        authToken.set(state?.token ?? null);
        state?.setHydrated(true);
      },
    },
  ),
);

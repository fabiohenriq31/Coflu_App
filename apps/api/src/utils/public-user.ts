import type { ThemeMode, User } from '@prisma/client';

const themeByMode: Record<ThemeMode, 'light' | 'dark' | 'system'> = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

type PublicUserSource = Pick<User, 'id' | 'name' | 'email' | 'defaultCurrency' | 'theme'>;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'system';
};

export const toPublicUser = (user: PublicUserSource): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  defaultCurrency: user.defaultCurrency,
  theme: themeByMode[user.theme],
});

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  defaultCurrency: true,
  theme: true,
} as const;

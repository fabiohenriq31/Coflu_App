export const colors = {
  brand: {
    primary: '#4EBAA4',
    accent: '#4D76FD',
  },
  neutral: {
    light: '#E6E8EC',
    softer: '#F1F5F9',
    dark: '#1C1C1E',
    white: '#FFFFFF',
    muted: '#94A3B8',
  },
  feedback: {
    success: '#4EBAA4',
    danger: '#EF4444',
    warning: '#F59E0B',
  },
  background: {
    light: '#F8FAFC',
    dark: '#111827',
    surface: '#FFFFFF',
    surfaceDark: '#1F2937',
  },
  text: {
    primary: '#1C1C1E',
    secondary: '#5A606B',
    muted: '#94A3B8',
    inverted: '#FFFFFF',
  },
};

export const lightColors = {
  background: colors.background.light,
  surface: colors.background.surface,
  surfaceMuted: colors.neutral.softer,
  border: colors.neutral.light,
  text: colors.text.primary,
  textSecondary: colors.text.secondary,
};

export const darkColors = {
  background: colors.background.dark,
  surface: colors.background.surfaceDark,
  surfaceMuted: '#273449',
  border: '#374151',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
};

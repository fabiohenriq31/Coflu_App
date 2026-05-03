import { useColorScheme } from 'react-native';

import { colors, darkColors, lightColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  light: lightColors,
  dark: darkColors,
  spacing,
  radius,
  shadows,
  typography,
};

export const useCofluTheme = (mode: 'light' | 'dark' | 'system' = 'system') => {
  const systemScheme = useColorScheme();
  const resolvedMode = mode === 'system' ? (systemScheme ?? 'light') : mode;

  return {
    ...theme,
    mode: resolvedMode,
    palette: resolvedMode === 'dark' ? darkColors : lightColors,
  };
};

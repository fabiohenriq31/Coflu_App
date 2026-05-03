import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neutral';
};

export const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: Props) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      styles[variant],
      (pressed || disabled || loading) && styles.pressed,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'ghost' ? colors.brand.accent : colors.text.inverted} />
    ) : (
      <Text
        style={[
          styles.text,
          variant === 'ghost' && styles.ghostText,
          variant === 'neutral' && styles.neutralText,
        ]}
      >
        {title}
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.brand.primary,
  },
  secondary: {
    backgroundColor: colors.brand.accent,
  },
  danger: {
    backgroundColor: colors.feedback.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  neutral: {
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  text: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 15,
    letterSpacing: 0,
  },
  ghostText: {
    color: colors.brand.accent,
  },
  neutralText: {
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.82,
  },
});

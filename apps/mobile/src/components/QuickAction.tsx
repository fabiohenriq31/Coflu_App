import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  icon: string;
  onPress: () => void;
  tone?: 'primary' | 'accent' | 'warning' | 'danger';
};

const toneColor = {
  primary: colors.brand.primary,
  accent: colors.brand.accent,
  warning: colors.feedback.warning,
  danger: colors.feedback.danger,
};

export const QuickAction = ({ icon, label, onPress, tone = 'primary' }: Props) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.container, pressed && styles.pressed]}
  >
    <View style={[styles.icon, { backgroundColor: toneColor[tone] }]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
    <Text numberOfLines={2} style={styles.label}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral.white,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  iconText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 16,
    letterSpacing: 0,
  },
  label: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});

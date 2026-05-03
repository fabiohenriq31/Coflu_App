import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
};

const toneColors = {
  success: { background: '#E8F8F4', text: colors.brand.primary },
  info: { background: '#EEF3FF', text: colors.brand.accent },
  warning: { background: '#FFF7ED', text: colors.feedback.warning },
  danger: { background: '#FEF2F2', text: colors.feedback.danger },
  neutral: { background: colors.neutral.softer, text: colors.text.secondary },
};

export const Badge = ({ label, tone = 'neutral' }: Props) => (
  <View style={[styles.badge, { backgroundColor: toneColors[tone].background }]}>
    <Text style={[styles.text, { color: toneColors[tone].text }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.button,
    fontSize: 12,
    letterSpacing: 0,
  },
});

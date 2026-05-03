import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Card } from './Card';

type Props = {
  label: string;
  value: string;
  tone?: 'positive' | 'negative' | 'info' | 'neutral';
};

const toneColor = {
  positive: colors.brand.primary,
  negative: colors.feedback.danger,
  info: colors.brand.accent,
  neutral: colors.text.primary,
};

export const StatCard = ({ label, value, tone = 'neutral' }: Props) => (
  <Card style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, { color: toneColor[tone] }]}>{value}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 8,
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    letterSpacing: 0,
  },
  value: {
    ...typography.title,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
});

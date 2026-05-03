import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

type Props = {
  amount: number;
  currency?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  style?: TextStyle;
};

export const AmountText = ({ amount, currency = 'BRL', tone = 'neutral', style }: Props) => (
  <Text style={[styles.amount, styles[tone], style]}>{formatCurrency(amount, currency)}</Text>
);

const styles = StyleSheet.create({
  amount: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  positive: {
    color: colors.brand.primary,
  },
  negative: {
    color: colors.feedback.danger,
  },
  neutral: {
    color: colors.text.primary,
  },
});

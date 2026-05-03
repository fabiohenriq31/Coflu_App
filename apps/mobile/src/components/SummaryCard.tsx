import { StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '../services/dashboard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

type Props = {
  summary: DashboardSummary;
  currency: string;
};

export const SummaryCard = ({ summary, currency }: Props) => {
  const isPositive = summary.balance >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Saldo do mes</Text>
      <Text
        style={[
          styles.balance,
          { color: isPositive ? colors.brand.primary : colors.feedback.danger },
        ]}
      >
        {formatCurrency(summary.balance, currency)}
      </Text>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Receitas</Text>
          <Text style={[styles.metricValue, styles.income]}>
            {formatCurrency(summary.income, currency)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Despesas</Text>
          <Text style={[styles.metricValue, styles.expense]}>
            {formatCurrency(summary.expense, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 16,
    padding: 22,
    borderRadius: 22,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    shadowColor: colors.neutral.dark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    letterSpacing: 0,
  },
  balance: {
    ...typography.title,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  metric: {
    flex: 1,
    gap: 5,
  },
  metricLabel: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  metricValue: {
    ...typography.button,
    fontSize: 16,
    letterSpacing: 0,
  },
  income: {
    color: colors.brand.accent,
  },
  expense: {
    color: colors.feedback.danger,
  },
  divider: {
    width: 1,
    height: 38,
    marginHorizontal: 14,
    backgroundColor: colors.neutral.light,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '../services/transactions';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/date';

type Props = {
  currency: string;
  onPress: () => void;
  transaction: Transaction;
};

export const TransactionListItem = ({ currency, onPress, transaction }: Props) => {
  const amount = Number(transaction.amount);
  const isExpense = transaction.type === 'expense';
  const amountColor = transaction.type === 'income' ? colors.brand.accent : colors.feedback.danger;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: transaction.category?.color ?? colors.neutral.softer },
        ]}
      >
        <Text style={styles.iconText}>
          {transaction.category?.icon ? transaction.category.icon.slice(0, 1).toUpperCase() : '$'}
        </Text>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.description}>
          {transaction.description || 'Sem descricao'}
        </Text>
        <Text style={styles.meta}>
          {transaction.category?.name ?? 'Sem categoria'} - {formatShortDate(transaction.date)}
        </Text>
      </View>

      <View style={styles.amountBox}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isExpense ? '-' : '+'}
          {formatCurrency(amount, currency)}
        </Text>
        <Text style={styles.type}>{transaction.type}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
  },
  iconBubble: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 14,
    letterSpacing: 0,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  description: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  meta: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0,
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    ...typography.button,
    fontSize: 14,
    letterSpacing: 0,
  },
  type: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 11,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});

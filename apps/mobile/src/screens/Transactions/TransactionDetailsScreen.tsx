import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { transactionsService, type Transaction } from '../../services/transactions';
import { useAuthStore } from '../../store/auth.store';
import { useGroupsStore } from '../../store/groups.store';
import { useTransactionsStore } from '../../store/transactions.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate } from '../../utils/date';

type Props = {
  onBack: () => void;
  onDeleted: () => void;
  onEdit: () => void;
  transactionId: string;
};

export const TransactionDetailsScreen = ({ onBack, onDeleted, onEdit, transactionId }: Props) => {
  const user = useAuthStore((state) => state.user);
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const deleteTransaction = useTransactionsStore((state) => state.deleteTransaction);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const currency = activeGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';

  const loadTransaction = useCallback(async () => {
    if (!activeGroup) {
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await transactionsService.getTransaction(activeGroup.id, transactionId);
      setTransaction(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [activeGroup, transactionId]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const handleDelete = () => {
    Alert.alert('Excluir transacao', 'Tem certeza que deseja excluir esta transacao?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!activeGroup) {
            return;
          }

          setIsDeleting(true);

          try {
            await deleteTransaction(activeGroup.id, transactionId);
            onDeleted();
          } catch (requestError) {
            setError(getApiErrorMessage(requestError));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <LoadingState message="Carregando detalhes..." />;
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.backText}>Transacoes</Text>
      </Pressable>

      {error ? <ErrorState message={error} onRetry={loadTransaction} /> : null}

      {transaction ? (
        <>
          <Card>
            <Text style={styles.type}>{transaction.type}</Text>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    transaction.type === 'income' ? colors.brand.accent : colors.feedback.danger,
                },
              ]}
            >
              {formatCurrency(Number(transaction.amount), currency)}
            </Text>
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={styles.meta}>
              {transaction.category?.name ?? 'Sem categoria'} - {formatShortDate(transaction.date)}
            </Text>
            <Text style={styles.meta}>
              {transaction.isPrivate ? 'Privada' : 'Compartilhada'} - Criada por{' '}
              {transaction.creator.name}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Divisao</Text>
            {transaction.splits.map((split) => (
              <View key={split.id} style={styles.splitRow}>
                <Text style={styles.splitUser}>
                  {split.userId === user?.id ? 'Voce' : split.userId}
                </Text>
                <Text style={styles.splitAmount}>
                  {formatCurrency(Number(split.amount), currency)}
                </Text>
              </View>
            ))}
          </Card>

          <View style={styles.actions}>
            <Button onPress={onEdit} title="Editar" variant="secondary" />

            <Pressable
              accessibilityRole="button"
              disabled={isDeleting}
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.text.inverted} />
              ) : (
                <Text style={styles.deleteButtonText}>Excluir</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  backText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 14,
    letterSpacing: 0,
  },
  type: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  amount: {
    ...typography.title,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
  },
  description: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  meta: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    letterSpacing: 0,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  splitUser: {
    ...typography.body,
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    letterSpacing: 0,
  },
  splitAmount: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 14,
    letterSpacing: 0,
  },
  actions: {
    gap: 12,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.feedback.danger,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 15,
    letterSpacing: 0,
  },
});

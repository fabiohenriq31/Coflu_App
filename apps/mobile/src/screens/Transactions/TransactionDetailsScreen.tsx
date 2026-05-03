import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getApiErrorMessage } from '../../services/api';
import { transactionsService, type Transaction } from '../../services/transactions';
import { useAuthStore } from '../../store/auth.store';
import { useGroupStore } from '../../store/group.store';
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
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const currency = selectedGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';

  const loadTransaction = useCallback(async () => {
    if (!selectedGroup) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await transactionsService.getTransaction(selectedGroup.id, transactionId);
      setTransaction(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroup, transactionId]);

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
          if (!selectedGroup) {
            return;
          }

          setIsDeleting(true);

          try {
            await transactionsService.deleteTransaction(selectedGroup.id, transactionId);
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
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brand.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text style={styles.backText}>Transacoes</Text>
        </Pressable>

        {error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nao foi possivel carregar</Text>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : null}

        {transaction ? (
          <>
            <View style={styles.card}>
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
                {transaction.category?.name ?? 'Sem categoria'} •{' '}
                {formatShortDate(transaction.date)}
              </Text>
              <Text style={styles.meta}>
                {transaction.isPrivate ? 'Privada' : 'Compartilhada'} • Criada por{' '}
                {transaction.creator.name}
              </Text>
            </View>

            <View style={styles.card}>
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
            </View>

            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={onEdit} style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 14,
    letterSpacing: 0,
  },
  card: {
    gap: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
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
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.brand.accent,
  },
  editButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 15,
    letterSpacing: 0,
  },
  deleteButton: {
    flex: 1,
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
  messageCard: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
  },
  messageTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0,
  },
  messageText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
});

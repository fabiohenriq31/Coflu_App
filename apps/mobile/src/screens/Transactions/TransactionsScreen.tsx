import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TransactionListItem } from '../../components/TransactionListItem';
import { getApiErrorMessage } from '../../services/api';
import { transactionsService, type Transaction } from '../../services/transactions';
import { useAuthStore } from '../../store/auth.store';
import { useGroupStore } from '../../store/group.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getCurrentPeriod } from '../../utils/date';

type Props = {
  onBack: () => void;
  onCreate: () => void;
  onOpenTransaction: (transactionId: string) => void;
};

export const TransactionsScreen = ({ onBack, onCreate, onOpenTransaction }: Props) => {
  const user = useAuthStore((state) => state.user);
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const period = useMemo(() => getCurrentPeriod(), []);

  const currency = selectedGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';

  const loadTransactions = useCallback(
    async (refreshing = false) => {
      setError('');
      setIsRefreshing(refreshing);

      if (!refreshing) {
        setIsLoading(true);
      }

      try {
        const group = selectedGroup ?? (await loadGroups())[0];

        if (!group) {
          setTransactions([]);
          return;
        }

        const data = await transactionsService.listTransactions(group.id, {
          month: period.month,
          year: period.year,
        });

        setTransactions(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadGroups, period.month, period.year, selectedGroup],
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brand.primary} size="large" />
          <Text style={styles.loadingText}>Carregando transacoes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.brand.primary]}
            onRefresh={() => loadTransactions(true)}
            refreshing={isRefreshing}
            tintColor={colors.brand.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Pressable accessibilityRole="button" onPress={onBack}>
              <Text style={styles.backText}>Dashboard</Text>
            </Pressable>
            <Text style={styles.title}>Transacoes</Text>
            <Text style={styles.subtitle}>
              {selectedGroup?.name ?? 'Selecione um grupo para continuar'}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onCreate} style={styles.newButton}>
            <Text style={styles.newButtonText}>Nova</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nao foi possivel carregar</Text>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : null}

        {!selectedGroup && !error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nenhum grupo encontrado</Text>
            <Text style={styles.messageText}>
              Crie um grupo financeiro para registrar transacoes.
            </Text>
          </View>
        ) : null}

        {selectedGroup && !transactions.length && !error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Sem transacoes neste mes</Text>
            <Text style={styles.messageText}>
              Toque em Nova para registrar a primeira movimentacao.
            </Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {transactions.map((transaction) => (
            <TransactionListItem
              currency={currency}
              key={transaction.id}
              onPress={() => onOpenTransaction(transaction.id)}
              transaction={transaction}
            />
          ))}
        </View>
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
    gap: 14,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    letterSpacing: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  backText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 13,
    letterSpacing: 0,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  newButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
  },
  newButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 14,
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
  list: {
    gap: 12,
  },
});

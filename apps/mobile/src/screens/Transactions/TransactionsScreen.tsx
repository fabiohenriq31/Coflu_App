import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { TransactionListItem } from '../../components/TransactionListItem';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { useGroupsStore } from '../../store/groups.store';
import { useTransactionsStore } from '../../store/transactions.store';
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
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const transactions = useTransactionsStore((state) => state.transactions);
  const fetchTransactions = useTransactionsStore((state) => state.fetchTransactions);
  const isLoadingTransactions = useTransactionsStore((state) => state.isLoadingTransactions);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const period = useMemo(() => getCurrentPeriod(), []);

  const currency = activeGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';
  const visibleTransactions = useMemo(
    () =>
      selectedType === 'all'
        ? transactions
        : transactions.filter((transaction) => transaction.type === selectedType),
    [selectedType, transactions],
  );
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, typeof visibleTransactions>();

    visibleTransactions.forEach((transaction) => {
      const key = transaction.date.slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), transaction]);
    });

    return Array.from(groups.entries());
  }, [visibleTransactions]);

  const loadTransactions = useCallback(
    async (refreshing = false) => {
      setError('');
      setIsRefreshing(refreshing);

      if (!refreshing) {
        setHasLoaded(false);
      }

      try {
        if (!activeGroup) {
          return;
        }

        await fetchTransactions(activeGroup.id, {
          month: period.month,
          year: period.year,
        });
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setHasLoaded(true);
        setIsRefreshing(false);
      }
    },
    [activeGroup, fetchTransactions, period.month, period.year],
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (!hasLoaded && isLoadingTransactions) {
    return <LoadingState message="Carregando transacoes..." />;
  }

  return (
    <Screen onRefresh={() => loadTransactions(true)} refreshing={isRefreshing}>
      <View style={styles.header}>
        <View>
          <Pressable accessibilityRole="button" onPress={onBack}>
            <Text style={styles.backText}>Dashboard</Text>
          </Pressable>
          <Text style={styles.title}>Transacoes</Text>
          <Text style={styles.subtitle}>
            {activeGroup?.name ?? 'Selecione um grupo para continuar'}
          </Text>
        </View>
        <Button onPress={onCreate} title="Nova" />
      </View>

      {error ? <ErrorState message={error} onRetry={() => loadTransactions()} /> : null}

      {!activeGroup && !error ? (
        <EmptyState
          description="Crie um grupo financeiro para registrar transacoes."
          title="Nenhum grupo encontrado"
        />
      ) : null}

      {activeGroup && !transactions.length && !error ? (
        <EmptyState
          description="Toque em Nova para registrar a primeira movimentacao."
          title="Sem transacoes neste mes"
        />
      ) : null}

      {activeGroup && transactions.length ? (
        <View style={styles.filters}>
          {[
            { label: 'Todas', value: 'all' as const },
            { label: 'Despesas', value: 'expense' as const },
            { label: 'Receitas', value: 'income' as const },
          ].map((filter) => (
            <Pressable
              accessibilityRole="button"
              key={filter.value}
              onPress={() => setSelectedType(filter.value)}
              style={[
                styles.filterButton,
                selectedType === filter.value && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.list}>
        {groupedTransactions.map(([date, items]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateLabel}>
              {new Intl.DateTimeFormat('pt-BR').format(new Date(date))}
            </Text>
            {items.map((transaction) => (
              <TransactionListItem
                currency={currency}
                key={transaction.id}
                onPress={() => onOpenTransaction(transaction.id)}
                transaction={transaction}
              />
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
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
  list: {
    gap: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
  },
  filterButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  filterText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  filterTextActive: {
    color: colors.text.inverted,
  },
  dateGroup: {
    gap: 8,
  },
  dateLabel: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 12,
    letterSpacing: 0,
  },
});

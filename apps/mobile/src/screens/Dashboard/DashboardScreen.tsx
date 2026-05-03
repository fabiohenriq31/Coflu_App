import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryItem } from '../../components/CategoryItem';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { MemberItem } from '../../components/MemberItem';
import { SummaryCard } from '../../components/SummaryCard';
import { getApiErrorMessage } from '../../services/api';
import {
  dashboardService,
  type DashboardCategory,
  type DashboardMember,
  type DashboardSummary,
} from '../../services/dashboard';
import { useAuthStore } from '../../store/auth.store';
import { useGroupsStore } from '../../store/groups.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getCurrentPeriod } from '../../utils/date';

const getMonthLabel = (month: number, year: number) =>
  new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

type Props = {
  onOpenTransactions: () => void;
  onCreateTransaction: () => void;
};

export const DashboardScreen = ({ onCreateTransaction, onOpenTransactions }: Props) => {
  const user = useAuthStore((state) => state.user);
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const period = useMemo(() => getCurrentPeriod(), []);
  const currency = activeGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';
  const activeGroupId = activeGroup?.id;

  const loadDashboard = useCallback(
    async (refreshing = false) => {
      setError('');
      setIsRefreshing(refreshing);

      if (!refreshing) {
        setIsLoading(true);
      }

      try {
        if (!activeGroupId) {
          setSummary(null);
          setCategories([]);
          setMembers([]);
          return;
        }

        const [summaryData, categoryData, memberData] = await Promise.all([
          dashboardService.getSummary(activeGroupId, period.month, period.year),
          dashboardService.getCategories(activeGroupId, period.month, period.year),
          dashboardService.getMembers(activeGroupId, period.month, period.year),
        ]);

        setSummary(summaryData);
        setCategories(categoryData);
        setMembers(memberData);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeGroupId, period.month, period.year],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    loadDashboard(true);
  };

  if (isLoading) {
    return <LoadingState message="Carregando dashboard..." />;
  }

  return (
    <Screen onRefresh={handleRefresh} refreshing={isRefreshing}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.brand}>Coflu</Text>
          <Text style={styles.greeting}>{user?.name ? `Ola, ${user.name}` : 'Ola'}</Text>
          <Text style={styles.groupName}>
            {activeGroup ? activeGroup.name : 'Nenhum grupo financeiro'}
          </Text>
        </View>
      </View>

      <Text style={styles.period}>{getMonthLabel(period.month, period.year)}</Text>

      <View style={styles.quickActions}>
        <Button onPress={onCreateTransaction} title="Nova transacao" />
        <Button onPress={onOpenTransactions} title="Ver transacoes" variant="secondary" />
      </View>

      {error ? <ErrorState message={error} onRetry={() => loadDashboard()} /> : null}

      {!activeGroup && !error ? (
        <EmptyState
          description="Assim que existir um grupo financeiro, seu dashboard aparecera aqui."
          title="Crie seu primeiro grupo"
        />
      ) : null}

      {activeGroup && summary ? (
        <>
          <SummaryCard currency={currency} summary={summary} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gastos por categoria</Text>
            <View style={styles.listCard}>
              {categories.length ? (
                categories.map((category) => (
                  <CategoryItem category={category} currency={currency} key={category.categoryId} />
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma despesa neste periodo.</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gastos por membro</Text>
            <View style={styles.listCard}>
              {members.length ? (
                members.map((member) => (
                  <MemberItem currency={currency} key={member.userId} member={member} />
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum split registrado neste periodo.</Text>
              )}
            </View>
          </View>
        </>
      ) : null}
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
  headerText: {
    flex: 1,
    gap: 6,
  },
  brand: {
    ...typography.title,
    color: colors.brand.primary,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0,
  },
  greeting: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  groupName: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  period: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    textTransform: 'capitalize',
    letterSpacing: 0,
  },
  quickActions: {
    gap: 10,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  listCard: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
  },
  emptyText: {
    ...typography.body,
    paddingVertical: 16,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});

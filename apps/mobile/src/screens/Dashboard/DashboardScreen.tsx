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

import { CategoryItem } from '../../components/CategoryItem';
import { MemberItem } from '../../components/MemberItem';
import { SummaryCard } from '../../components/SummaryCard';
import { getApiErrorMessage } from '../../services/api';
import {
  dashboardService,
  type DashboardCategory,
  type DashboardMember,
  type DashboardSummary,
} from '../../services/dashboard';
import { groupsService, type FinancialGroupSummary } from '../../services/groups';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const getMonthLabel = (month: number, year: number) =>
  new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));

export const DashboardScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [groups, setGroups] = useState<FinancialGroupSummary[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [members, setMembers] = useState<DashboardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const period = useMemo(() => getCurrentPeriod(), []);
  const selectedGroup = groups[0] ?? null;
  const currency = selectedGroup?.defaultCurrency ?? user?.defaultCurrency ?? 'BRL';

  const loadDashboard = useCallback(
    async (refreshing = false) => {
      setError('');
      setIsRefreshing(refreshing);

      if (!refreshing) {
        setIsLoading(true);
      }

      try {
        const userGroups = await groupsService.listGroups();
        const firstGroup = userGroups[0];

        setGroups(userGroups);

        if (!firstGroup) {
          setSummary(null);
          setCategories([]);
          setMembers([]);
          return;
        }

        const [summaryData, categoryData, memberData] = await Promise.all([
          dashboardService.getSummary(firstGroup.id, period.month, period.year),
          dashboardService.getCategories(firstGroup.id, period.month, period.year),
          dashboardService.getMembers(firstGroup.id, period.month, period.year),
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
    [period.month, period.year],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    loadDashboard(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brand.primary} size="large" />
          <Text style={styles.loadingText}>Carregando dashboard...</Text>
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
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={colors.brand.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>Coflu</Text>
            <Text style={styles.greeting}>{user?.name ? `Ola, ${user.name}` : 'Ola'}</Text>
            <Text style={styles.groupName}>
              {selectedGroup ? selectedGroup.name : 'Nenhum grupo financeiro'}
            </Text>
          </View>

          <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <Text style={styles.period}>{getMonthLabel(period.month, period.year)}</Text>

        {error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nao foi possivel carregar</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => loadDashboard()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        {!selectedGroup && !error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Crie seu primeiro grupo</Text>
            <Text style={styles.messageText}>
              Assim que existir um grupo financeiro, seu dashboard aparecera aqui.
            </Text>
          </View>
        ) : null}

        {selectedGroup && summary ? (
          <>
            <SummaryCard currency={currency} summary={summary} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gastos por categoria</Text>
              <View style={styles.listCard}>
                {categories.length ? (
                  categories.map((category) => (
                    <CategoryItem
                      category={category}
                      currency={currency}
                      key={category.categoryId}
                    />
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
    gap: 20,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: colors.background.light,
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
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  logoutText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 13,
    letterSpacing: 0,
  },
  period: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    textTransform: 'capitalize',
    letterSpacing: 0,
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
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
  },
  retryText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 14,
    letterSpacing: 0,
  },
});

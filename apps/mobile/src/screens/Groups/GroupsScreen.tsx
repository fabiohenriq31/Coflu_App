import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { type FinancialGroupSummary } from '../../services/groups';
import { useGroupsStore } from '../../store/groups.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onCreateGroup: () => void;
  onOpenGroup: (groupId: string) => void;
};

const roleLabel: Record<FinancialGroupSummary['membership']['role'], string> = {
  owner: 'Dono',
  admin: 'Admin',
  member: 'Membro',
  viewer: 'Visualizador',
};

export const GroupsScreen = ({ onCreateGroup, onOpenGroup }: Props) => {
  const groups = useGroupsStore((state) => state.groups);
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const fetchGroups = useGroupsStore((state) => state.fetchGroups);
  const setActiveGroup = useGroupsStore((state) => state.setActiveGroup);
  const isLoadingGroups = useGroupsStore((state) => state.isLoadingGroups);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (refreshing = false) => {
      setError('');
      setIsRefreshing(refreshing);

      try {
        await fetchGroups();
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchGroups],
  );

  useEffect(() => {
    load();
  }, [load]);

  if (isLoadingGroups && !groups.length) {
    return <LoadingState message="Carregando grupos..." />;
  }

  return (
    <Screen onRefresh={() => load(true)} refreshing={isRefreshing}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Grupos</Text>
          <Text style={styles.subtitle}>Escolha onde o fluxo financeiro vai acontecer.</Text>
        </View>
        <Button onPress={onCreateGroup} title="Novo" variant="secondary" />
      </View>

      {error ? <ErrorState message={error} onRetry={() => load()} /> : null}

      {!groups.length && !error ? (
        <EmptyState
          description="Crie um grupo para liberar dashboard, transacoes e convites."
          title="Nenhum grupo ainda"
        />
      ) : null}

      <View style={styles.list}>
        {groups.map((group) => {
          const isActive = activeGroup?.id === group.id;

          return (
            <Pressable
              accessibilityRole="button"
              key={group.id}
              onPress={() => setActiveGroup(group)}
            >
              <Card style={isActive ? styles.activeCard : undefined}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupText}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>
                      {roleLabel[group.membership.role]} • {group.defaultCurrency}
                    </Text>
                  </View>
                  <Text style={[styles.status, isActive && styles.activeStatus]}>
                    {isActive ? 'Ativo' : 'Selecionar'}
                  </Text>
                </View>
                <Button
                  onPress={() => onOpenGroup(group.id)}
                  title="Ver detalhes"
                  variant="ghost"
                />
              </Card>
            </Pressable>
          );
        })}
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
  headerText: {
    flex: 1,
    gap: 6,
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
    lineHeight: 21,
    letterSpacing: 0,
  },
  list: {
    gap: 12,
  },
  activeCard: {
    borderColor: colors.brand.primary,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupText: {
    flex: 1,
    gap: 4,
  },
  groupName: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  groupMeta: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    letterSpacing: 0,
  },
  status: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 13,
    letterSpacing: 0,
  },
  activeStatus: {
    color: colors.brand.primary,
  },
});

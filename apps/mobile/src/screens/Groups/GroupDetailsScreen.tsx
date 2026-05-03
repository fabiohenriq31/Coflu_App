import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { groupsService, type FinancialGroup } from '../../services/groups';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  groupId: string;
  onBack: () => void;
  onInvite: () => void;
};

export const GroupDetailsScreen = ({ groupId, onBack, onInvite }: Props) => {
  const [group, setGroup] = useState<FinancialGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGroup = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      setGroup(await groupsService.getGroup(groupId));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  if (isLoading) {
    return <LoadingState message="Carregando grupo..." />;
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.backText}>Grupos</Text>
      </Pressable>

      {error ? <ErrorState message={error} onRetry={loadGroup} /> : null}

      {group ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{group.name}</Text>
            <Text style={styles.subtitle}>
              {group.defaultCurrency} • {group.type}
            </Text>
          </View>

          <Button onPress={onInvite} title="Convidar membro" variant="secondary" />

          <Card>
            <Text style={styles.sectionTitle}>Membros</Text>
            {group.members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.memberText}>
                  <Text style={styles.memberName}>{member.user.name}</Text>
                  <Text style={styles.memberEmail}>{member.user.email}</Text>
                </View>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </Card>
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
  header: {
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
    letterSpacing: 0,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    letterSpacing: 0,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  memberText: {
    flex: 1,
    gap: 3,
  },
  memberName: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 14,
    letterSpacing: 0,
  },
  memberEmail: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  memberRole: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 12,
    letterSpacing: 0,
  },
});

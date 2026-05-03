import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/auth.store';
import { useGroupsStore } from '../../store/groups.store';
import { useTransactionsStore } from '../../store/transactions.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onOpenSettings: () => void;
};

export const ProfileScreen = ({ onOpenSettings }: Props) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const resetGroups = useGroupsStore((state) => state.resetGroups);
  const resetTransactions = useTransactionsStore((state) => state.resetTransactions);

  const handleLogout = async () => {
    await logout();
    resetGroups();
    resetTransactions();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Informacoes basicas da sua conta Coflu.</Text>
      </View>

      <Card>
        <Text style={styles.name}>{user?.name ?? 'Usuario Coflu'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Moeda</Text>
          <Text style={styles.value}>{user?.defaultCurrency ?? 'BRL'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tema</Text>
          <Text style={styles.value}>{user?.theme ?? 'system'}</Text>
        </View>
      </Card>

      <Button onPress={onOpenSettings} title="Configuracoes" variant="secondary" />
      <Button onPress={handleLogout} title="Sair da conta" variant="danger" />
    </Screen>
  );
};

const styles = StyleSheet.create({
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
    lineHeight: 21,
    letterSpacing: 0,
  },
  name: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    letterSpacing: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    letterSpacing: 0,
  },
  value: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 14,
    letterSpacing: 0,
  },
});

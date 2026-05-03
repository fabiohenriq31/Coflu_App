import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useGroupsStore } from '../../store/groups.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const integrations = ['WhatsApp', 'IA', 'Apple Shortcuts', 'Open Finance'];

type Props = {
  onBack: () => void;
};

export const SettingsScreen = ({ onBack }: Props) => {
  const activeGroup = useGroupsStore((state) => state.activeGroup);

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.backText}>Perfil</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Configuracoes</Text>
        <Text style={styles.subtitle}>Preferencias do grupo e integracoes futuras.</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Grupo ativo</Text>
        <Text style={styles.groupName}>{activeGroup?.name ?? 'Nenhum grupo selecionado'}</Text>
        <Text style={styles.description}>
          As proximas preferencias do grupo serao configuradas aqui.
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Integracoes</Text>
        {integrations.map((integration) => (
          <View key={integration} style={styles.integrationRow}>
            <Text style={styles.integrationName}>{integration}</Text>
            <Text style={styles.badge}>Em breve</Text>
          </View>
        ))}
      </Card>
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
    lineHeight: 21,
    letterSpacing: 0,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  groupName: {
    ...typography.button,
    color: colors.brand.primary,
    fontSize: 16,
    letterSpacing: 0,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  integrationName: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 15,
    letterSpacing: 0,
  },
  badge: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 12,
    letterSpacing: 0,
  },
});

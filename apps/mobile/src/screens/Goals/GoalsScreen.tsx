import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onOpenBudgets: () => void;
};

export const GoalsScreen = ({ onOpenBudgets }: Props) => (
  <Screen>
    <View style={styles.header}>
      <Text style={styles.title}>Metas</Text>
      <Text style={styles.subtitle}>
        Planeje objetivos e acompanhe orcamentos assim que o backend estiver disponivel.
      </Text>
    </View>

    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Metas compartilhadas</Text>
        <Badge label="Em breve" tone="info" />
      </View>
      <EmptyState
        description="Na proxima etapa, voce podera criar metas para viagens, reserva de emergencia e compras importantes."
        title="Nenhuma meta configurada"
      />
      <Button disabled onPress={() => undefined} title="Criar meta em breve" variant="neutral" />
    </Card>

    <View style={styles.section}>
      <SectionHeader title="Orcamentos" />
      <Card>
        <View style={styles.budgetPreview}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.previewText}>
            Defina limites por categoria e receba alertas antes de passar do combinado.
          </Text>
          <Badge label="Planejado" tone="warning" />
        </View>
        <Button onPress={onOpenBudgets} title="Ver area de orcamentos" variant="secondary" />
      </Card>
    </View>
  </Screen>
);

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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    ...typography.title,
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  section: {
    gap: 10,
  },
  budgetPreview: {
    gap: 12,
  },
  progressTrack: {
    height: 12,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.neutral.softer,
  },
  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: colors.feedback.warning,
  },
  previewText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
});

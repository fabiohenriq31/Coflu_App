import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onBack: () => void;
};

export const BudgetsScreen = ({ onBack }: Props) => (
  <Screen>
    <Pressable accessibilityRole="button" onPress={onBack}>
      <Text style={styles.backText}>Metas</Text>
    </Pressable>

    <View style={styles.header}>
      <Text style={styles.title}>Orcamentos</Text>
      <Text style={styles.subtitle}>
        Controle limites mensais por categoria quando a API de orcamentos estiver pronta.
      </Text>
    </View>

    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Limites por categoria</Text>
        <Badge label="Em breve" tone="warning" />
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <EmptyState
        description="Aqui ficarao alertas de percentual, limites mensais e acompanhamento por categoria."
        title="Nenhum orcamento configurado"
      />
      <Button
        disabled
        onPress={() => undefined}
        title="Criar orcamento em breve"
        variant="neutral"
      />
    </Card>
  </Screen>
);

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
});

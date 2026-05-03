import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { type FinancialGroupSummary } from '../../services/groups';
import { useGroupsStore } from '../../store/groups.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onCreated?: () => void;
  onBack?: () => void;
};

const groupTypes: Array<{ label: string; value: FinancialGroupSummary['type'] }> = [
  { label: 'Casal', value: 'couple' },
  { label: 'Familia', value: 'family' },
  { label: 'Amigos', value: 'friends' },
  { label: 'Outro', value: 'other' },
];

export const CreateGroupScreen = ({ onBack, onCreated }: Props) => {
  const createGroup = useGroupsStore((state) => state.createGroup);
  const isLoadingGroups = useGroupsStore((state) => state.isLoadingGroups);
  const [name, setName] = useState('');
  const [type, setType] = useState<FinancialGroupSummary['type']>('couple');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');

    if (!name.trim()) {
      setError('Informe o nome do grupo.');
      return;
    }

    try {
      await createGroup({
        name: name.trim(),
        type,
        defaultCurrency: 'BRL',
      });
      onCreated?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <Screen>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.logo}>Coflu</Text>
        <Text style={styles.title}>Crie seu primeiro grupo</Text>
        <Text style={styles.subtitle}>
          Um grupo conecta dashboard, transacoes e decisoes financeiras em um unico lugar.
        </Text>
      </View>

      <Card>
        <Input
          label="Nome do grupo"
          onChangeText={setName}
          placeholder="Familia Silva"
          value={name}
        />

        <View style={styles.segment}>
          {groupTypes.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.value}
              onPress={() => setType(item.value)}
              style={[styles.segmentButton, type === item.value && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, type === item.value && styles.segmentTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.currencyText}>Moeda padrao: BRL</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button loading={isLoadingGroups} onPress={handleCreate} title="Criar grupo" />
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
    gap: 10,
  },
  logo: {
    ...typography.title,
    color: colors.brand.primary,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: 0,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentButton: {
    minHeight: 42,
    minWidth: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  segmentButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  segmentText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  segmentTextActive: {
    color: colors.text.inverted,
  },
  currencyText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    letterSpacing: 0,
  },
  error: {
    ...typography.body,
    color: colors.feedback.danger,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});

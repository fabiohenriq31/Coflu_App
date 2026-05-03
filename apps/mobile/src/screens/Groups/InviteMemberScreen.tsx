import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { type InviteMemberPayload, groupsService } from '../../services/groups';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  groupId: string;
  onBack: () => void;
  onInvited: () => void;
};

const roles: Array<{ label: string; value: InviteMemberPayload['role'] }> = [
  { label: 'Admin', value: 'admin' },
  { label: 'Membro', value: 'member' },
  { label: 'Visualizador', value: 'viewer' },
];

export const InviteMemberScreen = ({ groupId, onBack, onInvited }: Props) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteMemberPayload['role']>('member');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um email valido.');
      return;
    }

    setIsSaving(true);

    try {
      await groupsService.inviteMember(groupId, {
        email: email.trim().toLowerCase(),
        role,
      });
      onInvited();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.backText}>Grupo</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Convidar membro</Text>
        <Text style={styles.subtitle}>
          Nesta versao, o usuario precisa ja existir no Coflu. O envio de email vem depois.
        </Text>
      </View>

      <Card>
        <Input
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="pessoa@email.com"
          value={email}
        />

        <View style={styles.segment}>
          {roles.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.value}
              onPress={() => setRole(item.value)}
              style={[styles.segmentButton, role === item.value && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, role === item.value && styles.segmentTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button loading={isSaving} onPress={handleInvite} title="Enviar convite" />
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
    gap: 8,
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
  segment: {
    gap: 8,
  },
  segmentButton: {
    minHeight: 42,
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
  error: {
    ...typography.body,
    color: colors.feedback.danger,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
});

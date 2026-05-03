import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { AuthStackParamList } from '../../navigation/AppNavigator';
import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, email e senha.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Coflu</Text>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Comece a cuidar do fluxo financeiro do seu grupo.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            autoComplete="name"
            onChangeText={setName}
            placeholder="Nome"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            value={name}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoComplete="password-new"
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isLoading) && styles.pressed,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverted} />
            ) : (
              <Text style={styles.primaryButtonText}>Criar conta</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Ja tenho conta</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    gap: 12,
    marginBottom: 36,
  },
  logo: {
    ...typography.title,
    color: colors.brand.primary,
    fontSize: 44,
    lineHeight: 50,
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
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  form: {
    gap: 14,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
    fontSize: 16,
    letterSpacing: 0,
  },
  error: {
    ...typography.body,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 16,
    letterSpacing: 0,
  },
  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  linkText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 15,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});

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

import { getApiErrorMessage } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onNavigateToRegister: () => void;
};

export const LoginScreen = ({ onNavigateToRegister }: Props) => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Informe email e senha.');
      return;
    }

    try {
      await login({
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
          <Text style={styles.title}>Entre na sua conta</Text>
          <Text style={styles.subtitle}>
            Continue organizando as financas com quem divide a vida.
          </Text>
        </View>

        <View style={styles.form}>
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
            autoComplete="password"
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
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isLoading) && styles.pressed,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.inverted} />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={onNavigateToRegister}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Criar uma conta</Text>
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

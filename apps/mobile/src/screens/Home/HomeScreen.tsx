import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Coflu</Text>
          <Text style={styles.title}>Bem-vindo ao Coflu</Text>
          <Text style={styles.subtitle}>
            {user?.name ? `Ola, ${user.name}.` : 'Sua sessao esta ativa.'}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Base conectada</Text>
          <Text style={styles.panelText}>
            Login real, token persistido e API pronta para os proximos fluxos financeiros.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isLoading}
          onPress={logout}
          style={({ pressed }) => [styles.logoutButton, (pressed || isLoading) && styles.pressed]}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>
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
    marginBottom: 28,
  },
  brand: {
    ...typography.title,
    color: colors.brand.primary,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 0,
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
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: 0,
  },
  panel: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
  },
  panelTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  panelText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: colors.brand.accent,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 16,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});

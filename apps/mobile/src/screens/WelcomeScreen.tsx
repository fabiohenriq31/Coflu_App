import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '../constants/app';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const WelcomeScreen = () => {
  const handleStart = () => {
    console.log('Start onboarding');
  };

  const handleSignIn = () => {
    console.log('Open sign in');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandMark} />

        <View style={styles.content}>
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={styles.slogan}>{APP_SLOGAN}</Text>
          <Text style={styles.description}>{APP_DESCRIPTION}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleStart}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Começar</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleSignIn}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
          </Pressable>
        </View>
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
    paddingVertical: 40,
  },
  brandMark: {
    width: 72,
    height: 72,
    marginBottom: 40,
    borderRadius: 24,
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 8,
  },
  content: {
    gap: 16,
  },
  logo: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: 0,
  },
  slogan: {
    ...typography.title,
    color: colors.brand.accent,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
  },
  description: {
    ...typography.body,
    maxWidth: 340,
    color: colors.text.secondary,
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
  },
  actions: {
    gap: 14,
    marginTop: 48,
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
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 16,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});

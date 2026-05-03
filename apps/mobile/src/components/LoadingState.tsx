import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  message?: string;
};

export const LoadingState = ({ message = 'Carregando...' }: Props) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
    letterSpacing: 0,
  },
});

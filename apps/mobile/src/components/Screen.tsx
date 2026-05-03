import { type ReactNode } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
};

export const Screen = ({ children, refreshing, onRefresh, style }: Props) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      contentContainerStyle={[styles.content, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            colors={[colors.brand.primary]}
            onRefresh={onRefresh}
            refreshing={Boolean(refreshing)}
            tintColor={colors.brand.primary}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    gap: 18,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

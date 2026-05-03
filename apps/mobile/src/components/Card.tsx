import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export const Card = ({ children, style }: Props) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
});

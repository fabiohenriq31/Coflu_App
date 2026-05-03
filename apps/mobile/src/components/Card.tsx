import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

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
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 18,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.dark,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});

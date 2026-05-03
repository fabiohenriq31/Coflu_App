import { StyleSheet, Text, View } from 'react-native';

import type { DashboardCategory } from '../services/dashboard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

type Props = {
  category: DashboardCategory;
  currency: string;
};

export const CategoryItem = ({ category, currency }: Props) => (
  <View style={styles.container}>
    <View style={styles.marker} />
    <Text numberOfLines={1} style={styles.name}>
      {category.name}
    </Text>
    <Text style={styles.total}>{formatCurrency(category.total, currency)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 12,
    paddingVertical: 10,
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.primary,
  },
  name: {
    ...typography.body,
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    letterSpacing: 0,
  },
  total: {
    ...typography.button,
    color: colors.feedback.danger,
    fontSize: 15,
    letterSpacing: 0,
  },
});

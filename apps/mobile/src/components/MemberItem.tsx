import { StyleSheet, Text, View } from 'react-native';

import type { DashboardMember } from '../services/dashboard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

type Props = {
  member: DashboardMember;
  currency: string;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const MemberItem = ({ member, currency }: Props) => (
  <View style={styles.container}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(member.name) || '?'}</Text>
    </View>
    <Text numberOfLines={1} style={styles.name}>
      {member.name}
    </Text>
    <Text style={styles.total}>{formatCurrency(member.total, currency)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    gap: 12,
    paddingVertical: 10,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.neutral.light,
  },
  avatarText: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 12,
    letterSpacing: 0,
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
    color: colors.text.primary,
    fontSize: 15,
    letterSpacing: 0,
  },
});

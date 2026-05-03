import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { typography } from '../theme/typography';

type Props = {
  name?: string | null;
  size?: number;
};

const getInitials = (name?: string | null) =>
  (name ?? 'Coflu')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const Avatar = ({ name, size = 46 }: Props) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: radius.pill }]}>
    <Text style={styles.text}>{getInitials(name)}</Text>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
  },
  text: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 15,
    letterSpacing: 0,
  },
});

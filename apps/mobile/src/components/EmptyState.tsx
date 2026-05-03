import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Card } from './Card';

type Props = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: Props) => (
  <Card>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </Card>
);

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
});

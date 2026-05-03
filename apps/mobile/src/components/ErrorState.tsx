import { StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { Card } from './Card';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title = 'Nao foi possivel carregar', message, onRetry }: Props) => (
  <Card>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? <Button onPress={onRetry} title="Tentar novamente" /> : null}
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
  message: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
});

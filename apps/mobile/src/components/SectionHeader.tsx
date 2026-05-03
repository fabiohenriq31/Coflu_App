import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Button } from './Button';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = ({ title, actionLabel, onAction }: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction ? (
      <Button onPress={onAction} title={actionLabel} variant="ghost" />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...typography.title,
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
});

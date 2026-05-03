import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = TextInputProps & {
  label?: string;
};

export const Input = ({ label, style, ...props }: Props) => (
  <View style={styles.container}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={colors.text.secondary}
      style={[styles.input, style]}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 13,
    letterSpacing: 0,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
    fontSize: 16,
    letterSpacing: 0,
  },
});

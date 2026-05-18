import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string | undefined;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, style, ...rest },
  ref,
) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textSecondary}
        {...rest}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: theme.typography.sizes.base,
          },
          style,
        ]}
      />
      {error ? (
        <Text
          variant="caption"
          style={{ color: theme.colors.danger, marginTop: theme.spacing.xs }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
  },
});

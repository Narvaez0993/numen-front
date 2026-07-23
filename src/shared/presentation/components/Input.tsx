import { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../theme';

import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string | undefined;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.accentCoral
    : focused
      ? theme.colors.accentMint
      : theme.colors.borderSubtle;

  return (
    <View style={{ width: '100%' }}>
      {label ? (
        <Text variant="label" muted style={{ marginBottom: theme.spacing.xs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          {
            backgroundColor: theme.colors.bgSurface,
            borderColor,
            borderWidth: 1,
            borderRadius: theme.radius.md,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: theme.colors.textPrimary,
            fontSize: 14,
            fontFamily: 'Geist_400Regular',
          },
          style,
        ]}
      />
      {error ? (
        <Text variant="caption" color={theme.colors.accentCoral} style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

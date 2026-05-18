import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { Theme } from '../theme';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

type Props = RNTextProps & {
  variant?: TextVariant;
  muted?: boolean;
};

export function Text({ variant = 'body', muted = false, style, ...rest }: Props) {
  const { theme } = useTheme();
  const variantStyle = buildVariantStyle(theme, variant);
  return (
    <RNText
      {...rest}
      style={[
        variantStyle,
        { color: muted ? theme.colors.textSecondary : theme.colors.textPrimary },
        style,
      ]}
    />
  );
}

function buildVariantStyle(theme: Theme, variant: TextVariant) {
  switch (variant) {
    case 'title':
      return StyleSheet.flatten({
        fontSize: theme.typography.sizes['2xl'],
        fontWeight: theme.typography.weights.bold,
      });
    case 'subtitle':
      return StyleSheet.flatten({
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
      });
    case 'caption':
      return StyleSheet.flatten({
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.regular,
      });
    case 'label':
      return StyleSheet.flatten({
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.medium,
      });
    case 'body':
    default:
      return StyleSheet.flatten({
        fontSize: theme.typography.sizes.base,
        fontWeight: theme.typography.weights.regular,
      });
  }
}

import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '../theme';

export type TextVariant =
  | 'display' // 30/500 — hero numbers
  | 'h1' // 17/500 — screen titles
  | 'h2' // 14/500 — section titles
  | 'bodyLarge' // 14/500 — row amounts
  | 'body' // 13/400 — body
  | 'caption' // 11.5/400 — metadata
  | 'micro' // 10.5/400 uppercase — labels
  | 'label'; // 13/500 — buttons

type Props = RNTextProps & {
  variant?: TextVariant;
  muted?: boolean;
  tabular?: boolean;
  uppercase?: boolean;
  color?: string;
};

export function Text({
  variant = 'body',
  muted = false,
  tabular = false,
  uppercase = false,
  color,
  style,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const variantStyle = variantStyles(variant);
  const resolvedColor =
    color ?? (muted ? theme.colors.textSecondary : theme.colors.textPrimary);

  return (
    <RNText
      {...rest}
      style={[
        variantStyle,
        {
          color: resolvedColor,
          fontFamily:
            variantStyle.fontWeight === '500' ? 'Geist_500Medium' : 'Geist_400Regular',
        },
        tabular && { fontVariant: ['tabular-nums'] satisfies TextStyle['fontVariant'] },
        uppercase && { textTransform: 'uppercase' as const },
        style,
      ]}
    />
  );
}

function variantStyles(variant: TextVariant): TextStyle {
  switch (variant) {
    case 'display':
      return { fontSize: 30, fontWeight: '500', letterSpacing: -0.6, lineHeight: 30 };
    case 'h1':
      return { fontSize: 17, fontWeight: '500', letterSpacing: -0.34 };
    case 'h2':
      return { fontSize: 14, fontWeight: '500' };
    case 'bodyLarge':
      return { fontSize: 14, fontWeight: '500', letterSpacing: -0.14 };
    case 'caption':
      return { fontSize: 11.5, fontWeight: '400' };
    case 'micro':
      return { fontSize: 10.5, fontWeight: '400', letterSpacing: 1.05 };
    case 'label':
      return { fontSize: 13, fontWeight: '500', letterSpacing: -0.13 };
    case 'body':
    default:
      return { fontSize: 13, fontWeight: '400' };
  }
}

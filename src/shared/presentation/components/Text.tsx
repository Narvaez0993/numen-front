import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '../theme';
import { usePrivacy } from '../theme/usePrivacy';

/** What a hidden figure reads as. `•` is the same width in a tabular font, so the
 *  layout does not move when the eye is switched. */
function mask(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'number') return mask(String(node));
  if (typeof node === 'string') return node.replace(/\d/g, '•');
  if (Array.isArray(node)) return node.map(mask);
  return node;
}

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
  children,
  ...rest
}: Props) {
  const { theme } = useTheme();
  // `tabular` is this app's `.num`: the design blurs exactly those, so hiding
  // figures needs no call site to opt in. React Native cannot blur text cheaply,
  // so they are masked instead — same intent, and the layout does not move.
  const hidden = usePrivacy((s) => s.hidden);
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
    >
      {tabular && hidden ? mask(children) : children}
    </RNText>
  );
}

function variantStyles(variant: TextVariant): TextStyle {
  switch (variant) {
    case 'display':
      // No lineHeight: at this size a box the height of the font shaves the tops
      // off the digits, and this variant exists to carry numbers.
      return { fontSize: 30, fontWeight: '500', letterSpacing: -0.6 };
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

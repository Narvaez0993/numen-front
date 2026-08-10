import { View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';

import { useTheme } from '../theme';
import { currencySymbol, formatAmountDigits } from '../utils/formatMoney';

import { Text } from './Text';

/** The two sizes the design draws: the manual sheet leads with the amount, the
 *  correction sheet is a step inside a flow and gives it slightly less. */
const SIZES = {
  sheet: { sign: 21, digits: 50, tracking: -2.4, caret: 42 },
  correct: { sign: 20, digits: 46, tracking: -2.2, caret: 38 },
} as const;

type Props = {
  digits: string;
  currency?: CurrencyCode;
  /** `−` on an expense, `+` on income, nothing on a transfer. Prefixed to the
   *  currency symbol, exactly as the bundle prints it. */
  sign?: string;
  color?: string;
  size?: keyof typeof SIZES;
};

/**
 * The amount, as the keypad types it.
 *
 * Not a `TextInput`: nothing here should be able to raise the system keyboard,
 * because the whole point of the app's own pad is that the bottom of the sheet
 * is a fixed, known height. A focusable field would let a stray tap cover the
 * layout the design depends on.
 *
 * The caret is drawn rather than blinked. It marks where the next digit lands
 * and never moves, which is all it has to do when the only way to type is a pad
 * that appends to the end.
 */
export function KeypadAmount({
  digits,
  currency,
  sign = '',
  color,
  size = 'sheet',
}: Props) {
  const { theme } = useTheme();
  const s = SIZES[size];
  const tint = color ?? theme.colors.textPrimary;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
      <Text color={tint} style={{ fontSize: s.sign, fontWeight: '300' }}>
        {sign}
        {currencySymbol(currency)}
      </Text>
      <Text
        tabular
        color={tint}
        style={{
          fontSize: s.digits,
          fontWeight: '500',
          letterSpacing: s.tracking,
          lineHeight: s.digits,
        }}
      >
        {formatAmountDigits(digits, currency) || '0'}
      </Text>
      <View
        style={{
          width: 2,
          height: s.caret,
          marginLeft: 2,
          borderRadius: 1,
          backgroundColor: theme.palette.acc,
        }}
      />
    </View>
  );
}

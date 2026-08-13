import { TextInput, View } from 'react-native';

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
  /** Replaces the currency symbol. `''` for a field that is not money — the day
   *  of the month is typed on the same pad and a `$` in front of it is a lie. */
  symbol?: string;
  /** Takes the system keyboard instead of the app's pad. Sheets that also hold
   *  WORDS use this: a pad cannot type a name, and one that covers the field you
   *  are trying to name is worse than no pad at all. */
  onChangeDigits?: (next: string) => void;
  autoFocus?: boolean;
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
  symbol,
  onChangeDigits,
  autoFocus = false,
}: Props) {
  const { theme } = useTheme();
  const s = SIZES[size];
  const tint = color ?? theme.colors.textPrimary;
  const shown = symbol === '' ? digits : formatAmountDigits(digits, currency);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
      <Text
        color={tint}
        style={{
          fontSize: s.sign,
          fontWeight: '300',
          // A TextInput lays its text out inside its own box, so `baseline`
          // leaves the symbol sitting slightly under the digits. Measured on a
          // 46px hero and kept proportional, so it holds at both sizes.
          marginBottom: onChangeDigits === undefined ? 0 : s.digits * 0.1,
        }}
      >
        {sign}
        {symbol ?? currencySymbol(currency)}
      </Text>

      {onChangeDigits === undefined ? (
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
          {shown || '0'}
        </Text>
      ) : (
        <TextInput
          value={shown}
          onChangeText={(next) => onChangeDigits(next.replace(/\D/g, ''))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textTertiary}
          autoFocus={autoFocus}
          selectionColor={theme.palette.acc}
          // No lineHeight: a TextInput lays its text out inside its own box, and
          // forcing one moves the baseline away from the symbol beside it. Left
          // alone, the platform's metrics line the two up.
          style={{
            flex: 1,
            padding: 0,
            fontSize: s.digits,
            letterSpacing: s.tracking,
            color: tint,
            fontFamily: 'Geist_500Medium',
            fontVariant: ['tabular-nums'],
            includeFontPadding: false,
          }}
        />
      )}

      {/* The drawn caret is the pad's — a real field brings the system's own. */}
      {onChangeDigits === undefined ? (
        <View
          style={{
            width: 2,
            height: s.caret,
            marginLeft: 2,
            borderRadius: 1,
            backgroundColor: theme.palette.acc,
          }}
        />
      ) : null}
    </View>
  );
}

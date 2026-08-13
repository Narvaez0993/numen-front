import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';
import { Text } from './Text';

/** `000` earns its own key because money here is counted in thousands: "veinte
 *  mil" is three taps with it and five without, every single time. */
const TRIPLE = '000';
const BACK = 'back';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', TRIPLE, '0', BACK];

/** Past this an amount is a mis-tap rather than a purchase. */
const MAX_DIGITS = 12;

/** Amounts are held as a digit string all the way through the form layer, so the
 *  keypad only ever appends and trims — no parsing, no float.
 *
 *  `max` exists because the same pad types things that are not money: a day of
 *  the month is two digits, and letting it reach twelve would accept the 4th of
 *  never. */
export function pressAmountKey(digits: string, key: string, max = MAX_DIGITS): string {
  if (key === BACK) return digits.slice(0, -1);
  const next = key === TRIPLE ? `${digits}000` : `${digits}${key}`;
  // Leading zeros would let "007" happen.
  const trimmed = next.replace(/^0+/, '');
  return trimmed.length > max ? digits : trimmed;
}

type Props = {
  onKey: (key: string) => void;
};

/**
 * The number pad the sheets are built around.
 *
 * The app draws its own rather than raising the system keyboard, and the reason
 * is the layout above it: the amount is 50px and the fields sit under it, which
 * only works if the bottom third of the screen is a known, fixed height. A
 * system keyboard is a different height on every device and covers whatever it
 * lands on, so the sheet would have to scroll — and a form you scroll to reach
 * the save button is a form, not a capture.
 *
 * Twelve keys, three of which are not digits: `000` for the way money is spoken
 * here, backspace, and nothing else. No decimal point — a cent has never been
 * typed into this app.
 */
export function AmountKeypad({ onKey }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {KEYS.map((key) => {
        const plain = key === TRIPLE || key === BACK;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={key === BACK ? 'borrar' : key}
            onPress={() => onKey(key)}
            style={({ pressed }) => ({
              // Three per row with two 8px gaps between them.
              width: '31.5%',
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 11,
              minHeight: 46,
              borderRadius: 14,
              backgroundColor: plain ? 'transparent' : theme.colors.bgSurface,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            {key === BACK ? (
              <Icon
                name="backspace"
                size={20}
                stroke={1.8}
                color={theme.colors.textTertiary}
              />
            ) : (
              <Text
                color={plain ? theme.colors.textTertiary : theme.colors.textPrimary}
                style={{ fontSize: plain ? 14 : 20 }}
              >
                {key}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

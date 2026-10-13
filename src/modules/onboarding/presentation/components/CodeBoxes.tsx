import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  value: string;
  length?: number;
  /** The code was wrong: every box says so until it is cleared. */
  error?: boolean;
};

/**
 * The six boxes of the code, fed by the app's own keypad rather than the
 * system keyboard — the design pins both, so the screen never jumps.
 *
 * The box that takes the next digit carries the accent: it is the cursor.
 */
export function CodeBoxes({ value, length = 6, error = false }: Props) {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel={value.split('').join(' ')}
      style={{ flexDirection: 'row', gap: 9, paddingHorizontal: 24 }}
    >
      {Array.from({ length }, (_, index) => {
        const digit = value[index] ?? '';
        const current = index === value.length;
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: 60,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: digit ? theme.colors.bgFloat : theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: error
                ? withAlpha(theme.colors.accentCoral, 0.6)
                : current
                  ? withAlpha(theme.palette.acc, 0.34)
                  : theme.colors.borderSubtle,
            }}
          >
            <Text tabular style={{ fontSize: 24, fontWeight: '500' }}>
              {digit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

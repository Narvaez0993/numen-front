import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { Text } from './Text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
};

/**
 * The design's one switch: two or three choices, side by side, the chosen one
 * lifted rather than tinted.
 *
 * It shows up wherever the choice changes what every number on screen MEANS —
 * "me deben" against "yo debo", weekly against yearly — which is why it sits
 * above those numbers instead of among the fields. Lifting the selection with a
 * lighter surface rather than filling it with the accent keeps the accent for
 * the money itself.
 */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        padding: 3,
        borderRadius: 15,
        backgroundColor: theme.colors.bgSurface,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: selected ? theme.colors.bgElevated : 'transparent',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              color={selected ? theme.colors.textPrimary : theme.colors.textTertiary}
              style={{ fontSize: 12.5, fontWeight: '500' }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

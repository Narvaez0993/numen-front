import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export type SuggestedChip = {
  id: string;
  label: string;
};

type Props = {
  chips: SuggestedChip[];
  disabled?: boolean;
  onPick: (chip: SuggestedChip) => void;
};

/**
 * What you might ask next.
 *
 * They wrap instead of scrolling sideways. A horizontal strip hides its last
 * chip off the edge, and a suggestion you cannot see is not a suggestion — the
 * whole point is that the next question is visible without thinking of one.
 */
export function SuggestedChips({ chips, disabled = false, onPick }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 20,
        paddingBottom: 10,
      }}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.id}
          accessibilityRole="button"
          onPress={() => onPick(chip)}
          disabled={disabled}
          style={({ pressed }) => ({
            minHeight: 40,
            justifyContent: 'center',
            paddingHorizontal: 14,
            borderRadius: 999,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          })}
        >
          <Text
            numberOfLines={1}
            color={theme.colors.textSecondary}
            style={{ fontSize: 12 }}
          >
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { SuggestedChip } from '../../domain/types/Assistant';

type Props = {
  chips: SuggestedChip[];
  disabled?: boolean;
  onPick: (chip: SuggestedChip) => void;
};

export function SuggestedChips({ chips, disabled = false, onPick }: Props) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      style={{ marginHorizontal: -16, marginBottom: 10 }}
    >
      {chips.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onPick(c)}
          disabled={disabled}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 12,
            backgroundColor: theme.colors.bgSurface,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.textSecondary}
            style={{ fontSize: 11.5 }}
            numberOfLines={1}
          >
            {c.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

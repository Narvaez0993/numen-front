import { Pressable, Text } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onPress: () => void;
  label?: string;
};

export function SkipLink({ onPress, label = 'Saltar' }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 4,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontFamily: 'Geist_500Medium',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

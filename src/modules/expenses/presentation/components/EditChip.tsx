import { Pressable } from 'react-native';

import { AccentColor, accentColorKey, useTheme } from '@/shared/presentation/theme';
import { Icon, IconName, Text } from '@/shared/presentation/components';

type Props = {
  icon: IconName;
  label: string;
  color?: AccentColor | 'neutral';
  onPress?: () => void;
};

export function EditChip({ icon, label, color = 'neutral', onPress }: Props) {
  const { theme } = useTheme();
  const bg =
    color === 'neutral'
      ? theme.colors.bgElevated
      : theme.colors[accentColorKey(color, 'bg')];
  const fg =
    color === 'neutral'
      ? theme.colors.textSecondary
      : theme.colors[accentColorKey(color, 'fg')];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: bg,
        opacity: pressed ? 0.85 : 1,
        alignSelf: 'flex-start',
      })}
    >
      <Icon name={icon} size={13} color={fg} />
      <Text variant="label" color={fg} style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Icon name="chevron-down" size={11} color={fg} />
    </Pressable>
  );
}

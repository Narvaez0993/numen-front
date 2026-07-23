import { Pressable, View } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import type { AccentColor } from '@/shared/domain';

type Props = {
  icon: IconName;
  iconColor?: AccentColor | 'neutral';
  value: string;
  placeholder?: boolean;
  onPress?: () => void;
  onClear?: () => void;
};

export function FakeSelectRow({
  icon,
  iconColor = 'mint',
  value,
  placeholder = false,
  onPress,
  onClear,
}: Props) {
  const { theme } = useTheme();
  const isNeutral = iconColor === 'neutral';
  const bg = isNeutral
    ? 'rgba(168,178,200,0.12)'
    : theme.colors[accentColorKey(iconColor, 'bg')];
  const fg = isNeutral
    ? theme.colors.textSecondary
    : theme.colors[accentColorKey(iconColor, 'fg')];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={14} stroke={1.9} color={fg} />
      </View>
      <Text
        variant="label"
        color={placeholder ? theme.colors.textTertiary : theme.colors.textPrimary}
        numberOfLines={1}
        style={{ flex: 1, fontSize: 13 }}
      >
        {value}
      </Text>
      {onClear ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onClear();
          }}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: theme.colors.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="x" size={11} color={theme.colors.textTertiary} />
        </Pressable>
      ) : (
        <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
      )}
    </Pressable>
  );
}

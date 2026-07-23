import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

type Props = {
  icon: string;
  color: AccentColor;
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
};

export function GoalCard({ icon, color, title, subtitle, active, onPress }: Props) {
  const { theme } = useTheme();
  const bgKey = accentColorKey(color, 'bg');
  const fgKey = accentColorKey(color, 'fg');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.bgSurface,
        borderRadius: 14,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.colors.accentMint : theme.colors.borderSubtle,
        padding: active ? 13 : 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          backgroundColor: theme.colors[bgKey],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color={theme.colors[fgKey]} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLarge" style={{ fontSize: 14.5 }}>
          {title}
        </Text>
        <Text variant="caption" muted style={{ fontSize: 12, lineHeight: 16 }}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

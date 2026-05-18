import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onBack?: () => void;
  center?: ReactNode;
  trailing?: ReactNode;
};

export function OnbHeader({ onBack, center, trailing }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingVertical: 4,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon
            name="arrow-left"
            size={18}
            stroke={1.9}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      ) : (
        <View style={{ width: 38, height: 38 }} />
      )}

      <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>

      <View
        style={{
          minWidth: 38,
          height: 38,
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {trailing}
      </View>
    </View>
  );
}

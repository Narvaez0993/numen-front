import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

export function SubScreenHeader({ title, onBack, rightAction }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        gap: 4,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.colors.bgSurface,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="chevron-left" size={18} color={theme.colors.textPrimary} />
        </Pressable>
      ) : (
        // Same width, so the title stays centred without a button to tap.
        <View style={{ width: 38, height: 38 }} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text variant="h1" style={{ fontSize: 15, letterSpacing: -0.3 }}>
          {title}
        </Text>
      </View>
      <View
        style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}
      >
        {rightAction ?? null}
      </View>
    </View>
  );
}

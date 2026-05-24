import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
  onPickerOpen: () => void;
};

export function HeroFrame({ children, onPickerOpen }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ position: 'relative' }}>
      {children}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar vista del Inicio"
        onPress={onPickerOpen}
        hitSlop={6}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 14,
          right: 14,
          width: 30,
          height: 30,
          borderRadius: 10,
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icon
          name="adjustments"
          size={14}
          color={theme.colors.textTertiary}
          stroke={1.8}
        />
      </Pressable>
    </View>
  );
}

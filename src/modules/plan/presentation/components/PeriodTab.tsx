import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  extra?: ReactNode;
};

export function PeriodTab({ label, active, onPress, extra }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? theme.colors.bgFloat : 'transparent',
        borderColor: active ? theme.colors.borderSubtle : 'transparent',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        variant="label"
        color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
      {extra && active ? <View style={{ marginLeft: 6 }}>{extra}</View> : null}
    </Pressable>
  );
}

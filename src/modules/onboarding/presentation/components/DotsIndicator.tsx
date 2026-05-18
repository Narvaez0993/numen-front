import { View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  total: number;
  current: number;
};

export function DotsIndicator({ total, current }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <View
            key={i}
            style={{
              width: active ? 24 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: active ? theme.colors.accentMint : theme.colors.bgElevated,
            }}
          />
        );
      })}
    </View>
  );
}

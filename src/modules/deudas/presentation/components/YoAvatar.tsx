import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = { size?: number };

export function YoAvatar({ size = 40 }: Props) {
  const { theme } = useTheme();
  const fs = Math.round(size * 0.36);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.accentMint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        variant="label"
        color="#0A0E1A"
        style={{ fontSize: fs, letterSpacing: 0.01 * fs }}
      >
        SM
      </Text>
    </View>
  );
}

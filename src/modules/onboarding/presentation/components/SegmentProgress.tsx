import { View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  total: number;
  current: number;
};

export function SegmentProgress({ total, current }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4, width: '100%' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            backgroundColor:
              i <= current ? theme.colors.accentMint : theme.colors.bgElevated,
          }}
        />
      ))}
    </View>
  );
}

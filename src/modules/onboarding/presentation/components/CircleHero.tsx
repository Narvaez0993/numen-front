import { View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

type Props = {
  icon: string;
  color: AccentColor;
};

export function CircleHero({ icon, color }: Props) {
  const { theme } = useTheme();
  const bgKey = accentColorKey(color, 'bg');
  const fgKey = accentColorKey(color, 'fg');
  return (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors[bgKey],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={36} stroke={1.6} color={theme.colors[fgKey]} />
    </View>
  );
}

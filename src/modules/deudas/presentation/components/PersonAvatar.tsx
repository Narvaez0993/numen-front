import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { Counterparty } from '../../domain/types/Deuda';

type Props = {
  person?: Counterparty | null;
  size?: number;
  fontSize?: number;
};

export function PersonAvatar({ person, size = 36, fontSize }: Props) {
  const { theme } = useTheme();
  if (!person) return null;
  const fs = fontSize ?? Math.round(size * 0.42);
  const bg = theme.colors[accentColorKey(person.color, 'bg')];
  const fg = theme.colors[accentColorKey(person.color, 'fg')];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="label" color={fg} style={{ fontSize: fs, letterSpacing: 0.01 * fs }}>
        {person.initial}
      </Text>
    </View>
  );
}

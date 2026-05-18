import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

type Props = {
  label: string;
  value: string;
  color?: AccentColor | 'primary';
  sub?: string;
};

export function RichStat({ label, value, color = 'primary', sub }: Props) {
  const { theme } = useTheme();
  const valueColor =
    color === 'primary'
      ? theme.colors.textPrimary
      : theme.colors[accentColorKey(color, 'fg')];

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: theme.colors.bgFloat,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        variant="micro"
        muted
        uppercase
        style={{ fontSize: 10, letterSpacing: 0.8, marginBottom: 4 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        variant="label"
        color={valueColor}
        tabular
        numberOfLines={1}
        style={{ fontSize: 16, letterSpacing: -0.16, lineHeight: 18 }}
      >
        {value}
      </Text>
      {sub ? (
        <Text
          variant="micro"
          muted
          numberOfLines={1}
          style={{ fontSize: 10.5, marginTop: 3, letterSpacing: 0 }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

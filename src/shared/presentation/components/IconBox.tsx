import { StyleProp, View, ViewStyle } from 'react-native';

import { AccentColor, accentColorKey, useTheme } from '../theme';

import { Icon, IconName } from './Icon';

type Props = {
  name: IconName;
  color?: AccentColor;
  size?: number;
  iconSize?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconBox({
  name,
  color = 'mint',
  size = 36,
  iconSize = 18,
  radius = 11,
  style,
}: Props) {
  const { theme } = useTheme();
  const bg = theme.colors[accentColorKey(color, 'bg')];
  const fg = theme.colors[accentColorKey(color, 'fg')];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon name={name} size={iconSize} color={fg} />
    </View>
  );
}

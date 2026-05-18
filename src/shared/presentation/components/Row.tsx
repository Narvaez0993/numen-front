import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { AccentColor, useTheme } from '../theme';

import { Icon, IconName } from './Icon';
import { IconBox } from './IconBox';
import { Text } from './Text';

type Props = {
  icon?: IconName;
  iconColor?: AccentColor;
  title: string;
  subtitle?: string;
  value?: string;
  valueSub?: string;
  chevron?: boolean;
  last?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Row({
  icon,
  iconColor = 'mint',
  title,
  subtitle,
  value,
  valueSub,
  chevron = false,
  last = false,
  onPress,
  style,
}: Props) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 13,
          paddingHorizontal: 4,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: theme.colors.borderSubtle,
        },
        style,
      ]}
    >
      {icon ? <IconBox name={icon} color={iconColor} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value !== undefined ? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodyLarge" tabular>
            {value}
          </Text>
          {valueSub ? (
            <Text variant="caption" muted style={{ marginTop: 2 }}>
              {valueSub}
            </Text>
          ) : null}
        </View>
      ) : null}
      {chevron ? (
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

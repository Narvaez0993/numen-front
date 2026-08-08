import { Pressable, View } from 'react-native';

import { AccentColor, accentColorKey, useTheme } from '../theme';

import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = {
  icon: IconName;
  iconColor?: AccentColor | 'neutral';
  title: string;
  subtitle?: string;
  value?: string;
  chevron?: boolean;
  last?: boolean;
  onPress?: () => void;
  /** A second, explicit action on the right — for rows whose tap already means
   * something better than "open settings for this". Renders a pencil. */
  onEdit?: () => void;
  /** Read out for the pencil; without it the button is a mystery to a screen
   * reader, since an icon alone carries no label. */
  editLabel?: string;
};

export function SettingsRow({
  icon,
  iconColor = 'neutral',
  title,
  subtitle,
  value,
  chevron = true,
  last = false,
  onPress,
  onEdit,
  editLabel,
}: Props) {
  const { theme } = useTheme();

  const isNeutral = iconColor === 'neutral';
  const iconBg = isNeutral
    ? 'rgba(168,178,200,0.10)'
    : theme.colors[accentColorKey(iconColor, 'bg')];
  const iconFg = isNeutral
    ? theme.colors.textSecondary
    : theme.colors[accentColorKey(iconColor, 'fg')];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: onPress && pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={16} color={iconFg} stroke={1.8} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" numberOfLines={1} style={{ fontSize: 13.5 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="label" muted style={{ fontSize: 12 }}>
          {value}
        </Text>
      ) : null}
      {onEdit ? (
        // Nested inside the row's Pressable on purpose: React Native hands the
        // touch to the innermost responder, so tapping the pencil never also
        // fires the row underneath it.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, paddingHorizontal: 2 })}
        >
          <Icon name="pencil" size={15} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
      {chevron ? (
        <Icon name="chevron-right" size={15} color={theme.colors.textTertiary} />
      ) : null}
    </Pressable>
  );
}

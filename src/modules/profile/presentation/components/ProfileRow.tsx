import { Pressable, View } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  icon: IconName;
  title: string;
  /** A second line under the title, for a row whose name is not the whole story. */
  subtitle?: string;
  /** The figure on the right: a count, a currency, a «Pronto». */
  value?: string;
  chevron?: boolean;
  /** Drops the hairline. The last row of a group closes it. */
  last?: boolean;
  danger?: boolean;
  onPress?: () => void;
};

/**
 * A row of Perfil, as the redesign draws it.
 *
 * The difference from the `SettingsRow` it replaces is the colour: that one gave
 * every row its own accent well — mint, amber, coral, purple — which made a list
 * of settings the brightest surface in an otherwise monochrome app. Here the
 * chip is the same white 7% for all of them and the only colour in the group is
 * the one row that signs you out.
 *
 * The right-hand figure is a count, not a sentence. «12» beside Categorías
 * answers what the old «8 estándar · 4 personalizadas» was trying to say, in a
 * glance and without wrapping on a narrow phone.
 */
export function ProfileRow({
  icon,
  title,
  subtitle,
  value,
  chevron = true,
  last = false,
  danger = false,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const ink = danger ? theme.colors.accentCoral : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        paddingVertical: 11,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 11,
          backgroundColor: danger ? theme.colors.accentCoralBg : theme.colors.bgFloat,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={icon}
          size={16}
          stroke={1.8}
          color={danger ? ink : theme.colors.textSecondary}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text color={ink} style={{ fontSize: danger ? 13.5 : 14 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text color={theme.colors.textTertiary} style={{ fontSize: 11, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
          {value}
        </Text>
      ) : null}
      {chevron && onPress ? (
        <Icon
          name="chevron-right"
          size={15}
          stroke={2}
          color={theme.colors.textTertiary}
        />
      ) : null}
    </Pressable>
  );
}

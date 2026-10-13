import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  name: string;
  /** Days left in the month — the header says how much runway is left, not the time
   *  of day. */
  daysLeft: number;
  /** Numbers are blurred while this is on. */
  hidden: boolean;
  onTogglePrivacy: () => void;
  onAvatarPress?: () => void;
};

/**
 * Wordmark, the runway, the way out.
 *
 * It stopped greeting. "Buenos días, Valentina" told the user something they
 * already knew; "quedan 12 días" tells them the one thing that changes what they
 * do next, and it sits beside the switch that hides every figure on the screen.
 */
export function HomeHeader({
  name,
  daysLeft,
  hidden,
  onTogglePrivacy,
  onAvatarPress,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        paddingTop: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: theme.palette.acc,
            shadowColor: theme.palette.acc,
            shadowOpacity: 0.6,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
        <Text
          uppercase
          color={theme.colors.textSecondary}
          style={{ fontSize: 12, letterSpacing: 3.4, fontWeight: '500' }}
        >
          deshka
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: hidden }}
          accessibilityLabel={t('home.privacy.toggle')}
          onPress={onTogglePrivacy}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minHeight: 44,
            paddingHorizontal: 14,
            borderRadius: 22,
            backgroundColor: theme.colors.bgFloat,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon
            name={hidden ? 'eye-off' : 'eye'}
            size={15}
            stroke={1.8}
            color={theme.colors.textSecondary}
          />
          <Text color={theme.colors.textSecondary} style={{ fontSize: 11.5 }}>
            {t('home.daysLeft', { count: daysLeft })}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.profile')}
          onPress={onAvatarPress}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: withAlpha(theme.palette.acc, 0.16),
            borderWidth: 1,
            borderColor: withAlpha(theme.palette.acc, 0.22),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text color={theme.palette.acc3} style={{ fontSize: 13, fontWeight: '600' }}>
            {initial}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

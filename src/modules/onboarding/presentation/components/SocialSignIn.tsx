import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

/**
 * «o» and the platform's own sign-in under the fields: Apple on an iPhone, as
 * the design draws it, and Google on Android, where Apple would be a stranger.
 *
 * Neither is wired yet, so the screen answers the tap with «Disponible muy
 * pronto» instead of failing — the button keeps its place, and the screen
 * already has its final shape. The screen owns that toast: it has to sit over
 * the whole screen, not inside this row.
 */
export function SocialSignIn({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const apple = Platform.OS === 'ios';

  return (
    <View style={{ paddingHorizontal: 4 }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}
      >
        <View
          style={{ flex: 1, height: 1, backgroundColor: theme.colors.borderSubtle }}
        />
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
          {t('auth.register.or')}
        </Text>
        <View
          style={{ flex: 1, height: 1, backgroundColor: theme.colors.borderSubtle }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          minHeight: 52,
          marginTop: 16,
          marginHorizontal: -4,
          borderRadius: 18,
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Icon
          name={apple ? 'brand-apple' : 'brand-google'}
          size={17}
          stroke={1.8}
          color={theme.colors.textPrimary}
        />
        <Text style={{ fontSize: 13.5, fontWeight: '500' }}>
          {t(apple ? 'auth.social.apple' : 'auth.social.google')}
        </Text>
      </Pressable>
    </View>
  );
}

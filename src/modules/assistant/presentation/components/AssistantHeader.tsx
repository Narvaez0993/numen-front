import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  initials?: string;
  onAvatarPress?: () => void;
  /** Opens «Tus Cortes». It lives in the header so the archive stays
   * reachable even when the shelf has nothing new to show. */
  onArchivePress?: () => void;
};

export function AssistantHeader({ initials, onAvatarPress, onArchivePress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profileName = useOnboardingStore((s) => s.profile?.name);
  const name = profileName?.trim() || 'Sebastián';
  const avatarInitials =
    initials ??
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingTop: 4,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="display"
          style={{ fontSize: 22, letterSpacing: -0.44 }}
          numberOfLines={1}
        >
          {t('assistant.title')}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 4 }} numberOfLines={1}>
          {t('assistant.greeting', { name })}
        </Text>
      </View>
      {onArchivePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('assistant.corte.shelfTitle')}
          onPress={onArchivePress}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.colors.bgSurface,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="books" size={17} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={onAvatarPress}
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: theme.colors.accentMintBg,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 12.5 }}>
          {avatarInitials}
        </Text>
      </Pressable>
    </View>
  );
}

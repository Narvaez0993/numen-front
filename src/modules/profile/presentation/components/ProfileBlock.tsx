import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { UserProfile } from '../../domain/types/UserProfile';

type Props = {
  profile: UserProfile;
  onEdit?: () => void;
};

export function ProfileBlock({ profile, onEdit }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 4,
        paddingTop: 10,
        paddingBottom: 22,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.accentMintBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          variant="h1"
          color={theme.colors.accentMint}
          style={{ fontSize: 22, letterSpacing: 0.2 }}
        >
          {profile.initials}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="h1" numberOfLines={1}>
          {profile.displayName}
        </Text>
        <Text
          variant="caption"
          muted
          numberOfLines={1}
          style={{ marginTop: 3, fontSize: 12 }}
        >
          {profile.email}
        </Text>
      </View>
      <Pressable
        onPress={onEdit}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text variant="label" muted style={{ fontSize: 11.5 }}>
          {t('profile.edit')}
        </Text>
      </Pressable>
    </View>
  );
}

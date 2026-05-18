import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  initials?: string;
  onAvatarPress?: () => void;
};

export function BudgetsHeader({ initials = 'SM', onAvatarPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
          {t('budgets.title')}
        </Text>
        <Text variant="caption" muted style={{ marginTop: 4 }} numberOfLines={1}>
          {t('budgets.subtitle')}
        </Text>
      </View>
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
          {initials}
        </Text>
      </Pressable>
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Subscription } from '../../domain';

type Props = {
  subscription: Subscription;
  onPress?: () => void;
};

export function SubscriptionCard({ subscription, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { name, icon, color, amount, every, account, nextInDays, urgent } = subscription;

  const pillBg = urgent ? theme.colors.accentAmberBg : theme.colors.accentMintBg;
  const pillFg = urgent ? theme.colors.accentAmber : theme.colors.accentMint;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <IconBox name={icon} color={color} size={40} iconSize={19} radius={12} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 2,
          }}
        >
          <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {name}
          </Text>
          <Text variant="bodyLarge" tabular style={{ fontSize: 13.5 }}>
            {formatMoney(amount)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text
            variant="caption"
            muted
            numberOfLines={1}
            style={{ flex: 1, fontSize: 11 }}
          >
            {t('subscriptions.card.cadence', { days: every, account })}
          </Text>
          <View
            style={{
              backgroundColor: pillBg,
              borderRadius: 6,
              paddingHorizontal: 7,
              paddingVertical: 3,
            }}
          >
            <Text variant="label" color={pillFg} style={{ fontSize: 10.5 }}>
              {t('subscriptions.card.next', { count: nextInDays })}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

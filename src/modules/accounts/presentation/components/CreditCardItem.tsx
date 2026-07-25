import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CreditCard } from '../../domain';

type Props = {
  card: CreditCard;
  onPress?: () => void;
};

export function CreditCardItem({ card, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const usage = card.limit > 0 ? card.debt / card.limit : 0;
  const usagePct = Math.round(usage * 100);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name={card.icon} color={card.color} size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyLarge" numberOfLines={1} style={{ fontSize: 13.5 }}>
            {card.name}
          </Text>
          <Text
            variant="caption"
            muted
            style={{ fontSize: 11, marginTop: 2 }}
            numberOfLines={1}
          >
            {t('accounts.tc.cutoff', { day: card.cutoffDay })}
            {card.dueDay ? ` · ${t('accounts.tc.due', { day: card.dueDay })}` : ''}
          </Text>
        </View>
        <Icon name="chevron-right" size={15} color={theme.colors.textTertiary} />
      </View>

      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Text
            variant="micro"
            muted
            uppercase
            style={{ fontSize: 10.5, letterSpacing: 1.05 }}
          >
            {t('accounts.tc.debt')}
          </Text>
          <Text variant="bodyLarge" tabular style={{ fontSize: 16 }}>
            {formatMoney(card.debt, card.currency)}
          </Text>
        </View>
        <ProgressBar pct={usage} height={5} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 6,
            gap: 8,
          }}
        >
          <Text
            variant="micro"
            muted
            tabular
            style={{ fontSize: 10.5, letterSpacing: 0 }}
          >
            {t('accounts.tc.usage', { pct: usagePct })}
          </Text>
          <Text
            variant="micro"
            muted
            tabular
            style={{ fontSize: 10.5, letterSpacing: 0 }}
          >
            {t('accounts.tc.limit', {
              amount: formatMoney(card.limit, card.currency),
            })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

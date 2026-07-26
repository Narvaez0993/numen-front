import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Icon, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  total: number;
  /** 0..1 — share of the month's income not spent. */
  savingsRate: number;
  /** `2026-07` — the month being summarised. */
  period: string;
  onPress?: () => void;
};

/** Only shown once there is income registered: nothing to summarise otherwise. */
export function IncomeSummaryRow({ total, savingsRate, period, onPress }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  if (total <= 0) return null;

  const pct = Math.round(savingsRate * 100);

  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="arrow-down-left" color="mint" size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="bodyLarge"
            style={{ fontSize: 13.5, letterSpacing: -0.135, marginBottom: 4 }}
          >
            {t('home.income.title', { month: monthName(`${period}-01`, i18n.language) })}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              variant="caption"
              color={theme.colors.accentMint}
              tabular
              style={{ fontSize: 11.5, fontFamily: 'Geist_500Medium' }}
            >
              {formatMoney(total)}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5 }}
            >
              · {t('home.income.savings', { pct })}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </Card>
  );
}

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DailyAllowance, Saldo } from '../../domain/types/HomeOverview';

type Props = { saldo: Saldo; daily: DailyAllowance };

export function SaldoHero({ saldo, daily }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const remaining = daily.suggested - daily.spent;
  const pct = daily.spent / daily.suggested;

  return (
    <Card padding={18} radius={20}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ marginBottom: 8, letterSpacing: 1.05, paddingRight: 44 }}
      >
        {t('home.saldo.label')}
      </Text>
      <Text variant="display" tabular style={{ marginBottom: 4 }}>
        {formatCOP(saldo.net)}
      </Text>
      <Text variant="caption" muted style={{ fontSize: 12, marginBottom: 16 }}>
        {t('home.saldo.breakdown', {
          count: saldo.accounts,
          accounts: saldo.accounts,
          tc: saldo.hasTC,
        })}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: theme.colors.bgFloat,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="micro"
            muted
            uppercase
            style={{ marginBottom: 4, letterSpacing: 0.84 }}
          >
            {t('home.saldo.today')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text variant="h1" tabular style={{ fontSize: 18, letterSpacing: -0.18 }}>
              {formatCOP(remaining)}
            </Text>
            <Text variant="caption" muted style={{ fontSize: 11 }}>
              {t('home.saldo.left')}
            </Text>
          </View>
          <View style={{ marginTop: 8 }}>
            <ProgressBar pct={pct} height={4} />
          </View>
        </View>
      </View>
    </Card>
  );
}

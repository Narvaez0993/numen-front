import { useTranslation } from 'react-i18next';

import type { CurrencyCode } from '@/shared/domain';
import { Card, Text } from '@/shared/presentation/components';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  netBalance: number;
  currency: CurrencyCode;
  accountsCount: number;
  creditCardsCount: number;
};

export function NetBalanceCard({
  netBalance,
  currency,
  accountsCount,
  creditCardsCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card padding={18} radius={18} style={{ marginBottom: 18 }}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 6 }}
      >
        {t('accounts.netBalance.label')}
      </Text>
      <Text
        variant="display"
        tabular
        style={{ fontSize: 28, lineHeight: 28, letterSpacing: -0.56 }}
      >
        {formatMoney(netBalance, currency)}
      </Text>
      <Text variant="caption" muted style={{ fontSize: 11.5, marginTop: 6 }}>
        {t('accounts.netBalance.breakdown', {
          count: accountsCount,
          accounts: accountsCount,
          cards: creditCardsCount,
        })}
      </Text>
    </Card>
  );
}

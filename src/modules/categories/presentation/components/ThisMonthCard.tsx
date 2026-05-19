import { useTranslation } from 'react-i18next';

import { Card, Text } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

type Props = {
  totalSpent: number;
  activeCount: number;
  totalCount: number;
};

export function ThisMonthCard({ totalSpent, activeCount, totalCount }: Props) {
  const { t } = useTranslation();
  return (
    <Card padding={18} radius={18} style={{ marginBottom: 16 }}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 6 }}
      >
        {t('categories.thisMonth.label')}
      </Text>
      <Text
        variant="display"
        tabular
        style={{ fontSize: 28, lineHeight: 28, letterSpacing: -0.56 }}
      >
        {formatCOP(totalSpent)}
      </Text>
      <Text variant="caption" muted style={{ fontSize: 11.5, marginTop: 6 }}>
        {t('categories.thisMonth.breakdown', { count: activeCount, total: totalCount })}
      </Text>
    </Card>
  );
}

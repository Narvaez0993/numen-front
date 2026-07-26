import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';

export default function BudgetsTab() {
  const { t } = useTranslation();
  const clearance = useFloatingTabBarClearance();
  return (
    <ComingSoon
      title={t('comingSoon.budgets.title')}
      body={t('comingSoon.budgets.body')}
      icon="target"
      bottomPadding={clearance}
    />
  );
}

import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from './_components/PlaceholderScreen';

export default function BudgetsTab() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      icon="target"
      title={t('tabs.budgets')}
      hint={t('placeholder.hint')}
    />
  );
}

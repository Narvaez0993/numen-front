import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from './_components/PlaceholderScreen';

export default function MovementsTab() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      icon="list-details"
      title={t('tabs.movements')}
      hint={t('placeholder.hint')}
    />
  );
}

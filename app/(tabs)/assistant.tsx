import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from './_components/PlaceholderScreen';

export default function AssistantTab() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      icon="sparkles"
      title={t('tabs.assistant')}
      hint={t('placeholder.hint')}
    />
  );
}

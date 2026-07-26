import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';

export default function AssistantTab() {
  const { t } = useTranslation();
  const clearance = useFloatingTabBarClearance();
  return (
    <ComingSoon
      title={t('comingSoon.assistant.title')}
      body={t('comingSoon.assistant.body')}
      icon="sparkles"
      bottomPadding={clearance}
    />
  );
}

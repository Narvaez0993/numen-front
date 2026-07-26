import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/shared/presentation/components';

export default function GoalsRoute() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t('comingSoon.goals.title')}
      body={t('comingSoon.goals.body')}
      icon="target"
      onBack={() => router.back()}
    />
  );
}

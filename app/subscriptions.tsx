import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/shared/presentation/components';

export default function SubscriptionsRoute() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t('comingSoon.subscriptions.title')}
      body={t('comingSoon.subscriptions.body')}
      icon="refresh"
      onBack={() => router.back()}
    />
  );
}

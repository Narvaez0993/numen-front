import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@/shared/presentation/components';

export default function DeudasRoute() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t('comingSoon.debts.title')}
      body={t('comingSoon.debts.body')}
      icon="users"
      onBack={() => router.back()}
    />
  );
}

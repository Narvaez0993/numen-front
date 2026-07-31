import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RetryState, SubScreenHeader } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { corteTitle, CorteFlatView } from '../components/corte/CorteFlatView';
import { useCorte } from '../hooks/useCortes';
import { useMarkCorteRead } from '../hooks/useCorteMutations';

/**
 * One Corte. For now it opens in the analytical flat view; the story player
 * mounts on top of this same data in the next slice.
 */
export function CorteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const corte = useCorte(id);
  const markRead = useMarkCorteRead();

  const unread = corte.data?.readAt === null;
  useEffect(() => {
    // Once per opening, only while unread — the server writes read_at once.
    if (unread && !markRead.isPending) markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, id]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader
        title={
          corte.data
            ? `${t('assistant.corte.title')} · ${corteTitle(corte.data.period, i18n.language)}`
            : t('assistant.corte.title')
        }
        onBack={() => router.back()}
      />
      {corte.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.textSecondary} />
        </View>
      ) : corte.isError || !corte.data ? (
        <RetryState
          titleKey="assistant.corte.loadFailed"
          retryKey="assistant.errors.retry"
          onRetry={() => corte.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <CorteFlatView corte={corte.data} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

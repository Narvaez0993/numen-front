import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RetryState, SubScreenHeader } from '@/shared/presentation/components';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { useTheme } from '@/shared/presentation/theme';

import { corteTitle, CorteFlatView } from '../components/corte/CorteFlatView';
import { PlayAction } from '../components/corte/PlayAction';
import { StoryPlayer } from '../components/corte/StoryPlayer';
import { useCorte } from '../hooks/useCortes';
import { useMarkCorteRead } from '../hooks/useCorteMutations';

/**
 * One Corte. It opens as stories (the show); the list icon flips it into the
 * analytical flat view — same frozen data, two ways to read a month.
 */
export function CorteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const corte = useCorte(id);
  const markRead = useMarkCorteRead();
  const [mode, setMode] = useState<'stories' | 'flat'>('stories');
  // Pinned once per mount: a re-render must not move the day.
  const today = useMemo(() => toIsoDate(new Date()), []);

  const unread = corte.data?.readAt === null;
  useEffect(() => {
    // Once per opening, only while unread — the server writes read_at once.
    if (unread && !markRead.isPending) markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, id]);

  const screenOptions = (
    <Stack.Screen options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
  );

  if (corte.isLoading || corte.isError || !corte.data) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
        edges={['top']}
      >
        {screenOptions}
        <SubScreenHeader
          title={t('assistant.corte.title')}
          onBack={() => router.back()}
        />
        {corte.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.textSecondary} />
          </View>
        ) : (
          <RetryState
            titleKey="assistant.corte.loadFailed"
            retryKey="assistant.errors.retry"
            onRetry={() => corte.refetch()}
          />
        )}
      </SafeAreaView>
    );
  }

  if (mode === 'stories') {
    return (
      <View style={{ flex: 1 }}>
        {screenOptions}
        <StoryPlayer
          corte={corte.data}
          onClose={() => router.back()}
          onOpenFlat={() => setMode('flat')}
          playAction={(play) => (
            <PlayAction output={corte.data!} play={play} today={today} />
          )}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      {screenOptions}
      <SubScreenHeader
        title={`${t('assistant.corte.title')} · ${corteTitle(corte.data.period, i18n.language)}`}
        onBack={() => setMode('stories')}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <CorteFlatView
          corte={corte.data}
          playAction={(playId) => {
            const play = corte.data?.plays.find((p) => p.id === playId);
            return play ? (
              <PlayAction output={corte.data!} play={play} today={today} />
            ) : null;
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

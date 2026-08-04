import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RetryState, SubScreenHeader } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate, toIsoDate } from '@/shared/presentation/utils/dates';

import { WeeklyReviewCard } from '../components/corte/WeeklyReviewCard';
import { useMarkCorteRead } from '../hooks/useCorteMutations';
import { useCorte } from '../hooks/useCortes';

/**
 * The weekly review on its own screen, with a back button to wherever it was
 * opened from (the shelf, Home's announcement). It replaced a bottom sheet:
 * the review grew into a report — days, categories, cap, goal, plan — and a
 * report wants a full page, not a drawer you hold open.
 *
 * Opening it is reading it — the same rule the Corte player follows. Removal
 * is not this screen's job: dismissing lives on the shelf (long-press).
 */
export function WeeklyReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const review = useCorte(id);
  const markRead = useMarkCorteRead();
  // Pinned once per mount: a re-render must not move the day.
  const today = useMemo(() => toIsoDate(new Date()), []);

  const unread = review.data?.readAt === null;
  useEffect(() => {
    // Once per opening, only while unread — the server writes read_at once.
    if (unread && !markRead.isPending) markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, id]);

  const weekly = review.data?.weekly ?? null;
  const title =
    weekly?.dateFrom && weekly.dateTo
      ? `${shortDate(weekly.dateFrom, i18n.language)} – ${shortDate(weekly.dateTo, i18n.language)}`
      : t('assistant.weekly.pill');

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader title={title} onBack={() => router.back()} />
      {review.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.textSecondary} />
        </View>
      ) : review.isError || !review.data || !weekly ? (
        <RetryState
          titleKey="assistant.errors.title"
          retryKey="assistant.errors.retry"
          onRetry={() => void review.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <WeeklyReviewCard review={review.data} today={today} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import {
  useConfirmCharge,
  useSkipCharge,
} from '@/modules/subscriptions/presentation/hooks/useCharges';
import { useSubscriptions } from '@/modules/subscriptions/presentation/hooks/useSubscriptions';
import { Aurora, RetryState } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { usePrivacy } from '@/shared/presentation/theme/usePrivacy';
import { monthName, toIsoDate } from '@/shared/presentation/utils/dates';

import { HomeHeader } from '../components/HomeHeader';
import { RecentList } from '../components/RecentList';
import { HomeHero } from '../components/HomeHero';
import { AccountsRow } from '../components/AccountsRow';
import { AutoCharges } from '../components/AutoCharges';
import { BudgetPulse } from '../components/BudgetPulse';
import { RhythmStrip } from '../components/RhythmStrip';
import { TodayHero } from '../components/TodayHero';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { useHomeOverview } from '../hooks/useHomeOverview';

export function HomeScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const privacyHidden = usePrivacy((state) => state.hidden);
  const togglePrivacy = usePrivacy((state) => state.toggle);
  // The device's local day, pinned once per mount: the server answers about the
  // user's calendar, and a re-render must not move the question.
  const today = useMemo(() => toIsoDate(new Date()), []);
  // Home carries the charges; their names and the monthly total live one
  // endpoint over, and this screen already talked to it for the shelf.
  const subscriptions = useSubscriptions(today);
  const { data, isLoading, isError, refetch } = useHomeOverview(today);
  const displayName = useAuthStore((s) => s.session?.displayName);
  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const openSheet = useExpenseSheetStore((s) => s.openSheet);
  const confirmCharge = useConfirmCharge();
  const skipCharge = useSkipCharge();
  const tabBarClearance = useFloatingTabBarClearance();

  const centered = {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (isError) {
    return (
      <SafeAreaView style={centered}>
        <RetryState
          titleKey="home.error.title"
          retryKey="home.error.retry"
          onRetry={() => void refetch()}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView style={centered}>
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  const goMovements = () => router.push('/movements');

  // The three things that turn the daily figure on, each answered by the payload
  // itself — nothing is remembered on the device, so this cannot drift from what
  // the user actually has.
  const startSteps = [
    {
      key: 'source',
      label: t('home.start.steps.source'),
      done: data.accountsCount + data.creditCardsCount > 0,
      onPress: () => router.push('/accounts'),
    },
    {
      key: 'expense',
      label: t('home.start.steps.expense'),
      done: data.month.spent > 0 || data.recent.some((m) => m.type === 'expense'),
      onPress: () => openSheet('manual', 'expense'),
    },
    {
      key: 'income',
      label: t('home.start.steps.income', {
        month: monthName(`${data.period}-01`, i18n.language),
      }),
      done: data.month.income > 0,
      onPress: () => openSheet('manual', 'income'),
    },
  ];

  return (
    <Aurora>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <HomeHeader
          name={displayName?.trim() || onboardingName?.trim() || t('home.greeting.you')}
          daysLeft={data.daysLeft}
          hidden={privacyHidden}
          onTogglePrivacy={togglePrivacy}
          onAvatarPress={() => router.push('/profile')}
        />
        <ScrollView
          contentContainerStyle={{
            paddingTop: 4,
            paddingBottom: tabBarClearance,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 18 }}>
            {/* The bundle draws Home for a user who already has a month. A
                first-timer still gets the checklist — dropping it would leave
                them a screen of zeros with nothing to do. */}
            {data.recent.length === 0 ? (
              <TodayHero
                focus={data.focus}
                objective={data.objective}
                month={data.month}
                pace={data.pace}
                budget={data.budget}
                debts={data.debts}
                goal={data.goal}
                netBalance={data.netBalance}
                cardDebt={data.cardDebt}
                cardLimit={data.cardLimit}
                period={data.period}
                daysLeft={data.daysLeft}
                onSaldoPress={() => router.push('/accounts')}
                onBudgetPress={() => router.push('/(tabs)/budgets')}
                // The month's spend is the movements that made it, not a budget.
                onMonthPress={goMovements}
                start={{ steps: startSteps, firstTime: true }}
                // Every invitation points at something that exists today: the debts
                // ledger, the first goal, or the month's income.
                onInvite={
                  data.objective === 'deudas'
                    ? () => router.push('/deudas')
                    : data.objective === 'ahorrar'
                      ? () => router.push('/goals')
                      : () => openSheet('manual', 'income')
                }
                onGoalPress={() => router.push('/goals')}
              />
            ) : (
              <HomeHero
                spent={data.month.spent}
                change={data.month.change}
                monthName={monthName(`${data.period}-01`, i18n.language)}
                onCortePress={() => router.push('/resumenes')}
              />
            )}
            <RhythmStrip
              byDay={data.byDay}
              spentToday={data.month.spentToday}
              dailyAverage={data.pace?.dailyAverage ?? null}
              language={i18n.language}
            />
            {data.budget ? (
              <BudgetPulse
                budget={data.budget}
                daysLeft={data.daysLeft}
                elapsed={data.daysElapsed / (data.daysElapsed + data.daysLeft)}
                onPress={() => router.push('/(tabs)/budgets')}
              />
            ) : null}
            <AccountsRow
              netBalance={data.netBalance}
              accountsCount={data.accountsCount}
              creditCardsCount={data.creditCardsCount}
              owedToMe={data.debts.owedToMe}
              onPress={() => router.push('/accounts')}
            />
            <RecentList items={data.recent} today={today} onSeeAll={goMovements} />
            <TopCategoriesCard
              categories={data.topCategories}
              onSeeCaps={() => router.push('/(tabs)/budgets')}
            />
            <AutoCharges
              items={data.upcoming}
              monthlyTotal={subscriptions.data?.monthly ?? null}
              nameOf={(id) =>
                subscriptions.data?.subscriptions.find((sub) => sub.id === id)?.name ??
                '—'
              }
              today={today}
              language={i18n.language}
              busy={confirmCharge.isPending || skipCharge.isPending}
              onConfirm={(id) => confirmCharge.mutate({ id })}
              onSkip={(id) => skipCharge.mutate(id)}
              onSeeAll={() => router.push('/subscriptions')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Aurora>
  );
}

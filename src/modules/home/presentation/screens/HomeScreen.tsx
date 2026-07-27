import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import {
  useConfirmCharge,
  useSkipCharge,
} from '@/modules/subscriptions/presentation/hooks/useCharges';
import { Text } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, toIsoDate } from '@/shared/presentation/utils/dates';

import { HomeHeader } from '../components/HomeHeader';
import { IncomeSummaryRow } from '../components/IncomeSummaryRow';
import { RecentList } from '../components/RecentList';
import { TodayHero } from '../components/TodayHero';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { UpcomingCharges } from '../components/UpcomingCharges';
import { useHomeOverview } from '../hooks/useHomeOverview';

export function HomeScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  // The device's local day, pinned once per mount: the server answers about the
  // user's calendar, and a re-render must not move the question.
  const today = useMemo(() => toIsoDate(new Date()), []);
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
        <View style={{ paddingHorizontal: 32, alignItems: 'center', gap: 16 }}>
          <Text variant="body" muted style={{ fontSize: 14, textAlign: 'center' }}>
            {t('home.error.title')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 11,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="label"
              color={theme.colors.accentMint}
              style={{ fontSize: 13 }}
            >
              {t('home.error.retry')}
            </Text>
          </Pressable>
        </View>
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: tabBarClearance,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 18 }}>
          <HomeHeader
            name={displayName?.trim() || onboardingName?.trim() || t('home.greeting.you')}
            onAvatarPress={() => router.push('/profile')}
          />
          <TodayHero
            focus={data.focus}
            objective={data.objective}
            month={data.month}
            pace={data.pace}
            budget={data.budget}
            netBalance={data.netBalance}
            cardDebt={data.cardDebt}
            cardLimit={data.cardLimit}
            period={data.period}
            daysLeft={data.daysLeft}
            onSaldoPress={() => router.push('/accounts')}
            onBudgetPress={() => router.push('/(tabs)/budgets')}
            // The month's spend is the movements that made it, not a budget.
            onMonthPress={goMovements}
            start={{ steps: startSteps, firstTime: data.recent.length === 0 }}
            // Both invitations point at something that exists today.
            onInvite={
              data.objective === 'deudas'
                ? () => router.push('/accounts')
                : () => openSheet('manual', 'income')
            }
          />
          <IncomeSummaryRow
            total={data.month.income}
            savingsRate={data.month.savingsRate}
            period={data.period}
            onPress={goMovements}
          />
          <UpcomingCharges
            items={data.upcoming}
            today={today}
            busy={confirmCharge.isPending || skipCharge.isPending}
            onConfirm={(id) => confirmCharge.mutate({ id })}
            onSkip={(id) => skipCharge.mutate(id)}
            onSeeAll={() => router.push('/subscriptions')}
          />
          <RecentList items={data.recent} onSeeAll={goMovements} />
          <TopCategoriesCard categories={data.topCategories} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

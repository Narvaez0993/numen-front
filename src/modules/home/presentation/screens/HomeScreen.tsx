import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeudasInicioCard } from '@/modules/deudas/presentation/components/DeudasInicioCard';
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { GoalsInicioCard } from '@/modules/goals/presentation/components/GoalsInicioCard';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';

import { HomeHeader } from '../components/HomeHeader';
import { IncomeSummaryRow } from '../components/IncomeSummaryRow';
import { RecentList } from '../components/RecentList';
import { TodayHero } from '../components/TodayHero';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { UpcomingSubs } from '../components/UpcomingSubs';
import { useHomeOverview } from '../hooks/useHomeOverview';

export function HomeScreen() {
  const { theme } = useTheme();
  const { data, isLoading } = useHomeOverview();
  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const tabBarClearance = useFloatingTabBarClearance();
  useDeudas();

  if (isLoading || !data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.bgBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  const goMovements = () => router.push('/movements');

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
            name={onboardingName?.trim() || data.greeting}
            onAvatarPress={() => router.push('/profile')}
          />
          <TodayHero
            daily={data.daily}
            saldo={data.saldo}
            month={data.month}
            onSaldoPress={() => router.push('/accounts')}
            onMonthPress={() => router.push('/budgets')}
          />
          <IncomeSummaryRow
            income={data.income}
            monthName={data.month.name}
            onPress={goMovements}
          />
          <RecentList items={data.recent} onSeeAll={goMovements} />
          <GoalsInicioCard onPress={() => router.push('/goals')} />
          <UpcomingSubs items={data.upcoming} />
          <TopCategoriesCard categories={data.topCategories} />
          <DeudasInicioCard onPress={() => router.push('/deudas')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

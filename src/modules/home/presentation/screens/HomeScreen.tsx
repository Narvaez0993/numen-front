import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/presentation/theme';

import { DailyHero } from '../components/DailyHero';
import { HomeHeader } from '../components/HomeHeader';
import { RecentList } from '../components/RecentList';
import { SaldoCompact } from '../components/SaldoCompact';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { UpcomingSubs } from '../components/UpcomingSubs';
import { useHomeOverview } from '../hooks/useHomeOverview';

export function HomeScreen() {
  const { theme } = useTheme();
  const { data, isLoading } = useHomeOverview();

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 130,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 18 }}>
          <HomeHeader
            name={data.greeting}
            onAvatarPress={() => router.push('/profile')}
          />
          <DailyHero daily={data.daily} />
          <SaldoCompact saldo={data.saldo} />
          <TopCategoriesCard categories={data.topCategories} />
          <UpcomingSubs items={data.upcoming} />
          <RecentList items={data.recent} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

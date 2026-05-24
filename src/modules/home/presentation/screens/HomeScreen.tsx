import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/presentation/theme';

import { DailyHero } from '../components/DailyHero';
import { HeroFrame } from '../components/HeroFrame';
import { HeroVariantSheet } from '../components/HeroVariantSheet';
import { HomeHeader } from '../components/HomeHeader';
import { MesHero } from '../components/MesHero';
import { RecentList } from '../components/RecentList';
import { SaldoCompact } from '../components/SaldoCompact';
import { SaldoHero } from '../components/SaldoHero';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { UpcomingSubs } from '../components/UpcomingSubs';
import { useHomeOverview } from '../hooks/useHomeOverview';
import { useHeroVariantStore } from '../stores/useHeroVariantStore';

export function HomeScreen() {
  const { theme } = useTheme();
  const { data, isLoading } = useHomeOverview();
  const variant = useHeroVariantStore((s) => s.variant);
  const setVariant = useHeroVariantStore((s) => s.setVariant);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const hero =
    variant === 'saldo' ? (
      <SaldoHero saldo={data.saldo} daily={data.daily} />
    ) : variant === 'mes' ? (
      <MesHero month={data.month} daily={data.daily} />
    ) : (
      <DailyHero daily={data.daily} />
    );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 18 }}>
          <HomeHeader
            name={data.greeting}
            onAvatarPress={() => router.push('/profile')}
          />
          <HeroFrame onPickerOpen={() => setPickerOpen(true)}>{hero}</HeroFrame>
          {variant !== 'saldo' ? <SaldoCompact saldo={data.saldo} /> : null}
          <TopCategoriesCard categories={data.topCategories} />
          <UpcomingSubs items={data.upcoming} />
          <RecentList items={data.recent} />
        </View>
      </ScrollView>

      <HeroVariantSheet
        visible={pickerOpen}
        variant={variant}
        onChange={setVariant}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

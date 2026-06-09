import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeudasInicioCard } from '@/modules/deudas/presentation/components/DeudasInicioCard';
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { useTheme } from '@/shared/presentation/theme';

import { CompactStatsRow } from '../components/CompactStatsRow';
import { DailyHero } from '../components/DailyHero';
import { HeroFrame } from '../components/HeroFrame';
import { HeroVariantSheet } from '../components/HeroVariantSheet';
import { HomeHeader } from '../components/HomeHeader';
import { LayoutPickerSheet } from '../components/LayoutPickerSheet';
import { MesGastadoCompact } from '../components/MesGastadoCompact';
import { MesHero } from '../components/MesHero';
import { RecentList } from '../components/RecentList';
import { SaldoCompact } from '../components/SaldoCompact';
import { SaldoHero } from '../components/SaldoHero';
import { TopCategoriesCard } from '../components/TopCategoriesCard';
import { UpcomingSubs } from '../components/UpcomingSubs';
import { useHomeOverview } from '../hooks/useHomeOverview';
import { useHeroVariantStore } from '../stores/useHeroVariantStore';
import { useHomeLayoutStore } from '../stores/useHomeLayoutStore';

export function HomeScreen() {
  const { theme } = useTheme();
  const { data, isLoading } = useHomeOverview();
  useDeudas();
  const variant = useHeroVariantStore((s) => s.variant);
  const setVariant = useHeroVariantStore((s) => s.setVariant);
  const layout = useHomeLayoutStore((s) => s.layout);
  const setLayout = useHomeLayoutStore((s) => s.setLayout);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);

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

  const goMovements = () => router.push('/movements');
  const goDeudas = () => router.push('/deudas');

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
            onLayoutPress={() => setLayoutPickerOpen(true)}
          />
          <HeroFrame onPickerOpen={() => setPickerOpen(true)}>{hero}</HeroFrame>

          {layout === 'compacto' ? (
            <>
              <CompactStatsRow
                saldo={data.saldo}
                month={data.month}
                heroVariant={variant}
                onOpenMovimientos={goMovements}
              />
              <DeudasInicioCard onPress={goDeudas} />
              <TopCategoriesCard categories={data.topCategories} />
              <UpcomingSubs items={data.upcoming} />
              <RecentList items={data.recent} />
            </>
          ) : (
            <>
              <RecentList items={data.recent} />
              <UpcomingSubs items={data.upcoming} />
              <TopCategoriesCard categories={data.topCategories} />
              {variant !== 'saldo' ? <SaldoCompact saldo={data.saldo} /> : null}
              <MesGastadoCompact month={data.month} onPress={goMovements} />
              <DeudasInicioCard onPress={goDeudas} />
            </>
          )}
        </View>
      </ScrollView>

      <HeroVariantSheet
        visible={pickerOpen}
        variant={variant}
        onChange={setVariant}
        onClose={() => setPickerOpen(false)}
      />
      <LayoutPickerSheet
        visible={layoutPickerOpen}
        layout={layout}
        onChange={setLayout}
        onClose={() => setLayoutPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

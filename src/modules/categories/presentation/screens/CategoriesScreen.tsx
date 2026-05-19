import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel, SubScreenHeader, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { CategoryRow } from '../components/CategoryRow';
import { CategorySearchBar } from '../components/CategorySearchBar';
import { CustomCategoriesUpsell } from '../components/CustomCategoriesUpsell';
import { ThisMonthCard } from '../components/ThisMonthCard';
import { useCategories } from '../hooks/useCategories';
import { filterCategories } from '../utils/filterCategories';

export function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useCategories();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const matched = filterCategories(query, data.categories);
    return [...matched].sort((a, b) => b.spent - a.spent);
  }, [query, data]);

  if (isLoading || !data) {
    return (
      <SafeAreaView
        edges={['top']}
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
      edges={['top']}
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
    >
      <SubScreenHeader title={t('categories.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThisMonthCard
          totalSpent={data.totalSpent}
          activeCount={data.activeCount}
          totalCount={data.totalCount}
        />

        <CategorySearchBar value={query} onChange={setQuery} />

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('categories.groups.standard', { count: filtered.length })}
        </SectionLabel>
        <View
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          {filtered.length === 0 ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
              <Text variant="body" muted style={{ fontSize: 13, textAlign: 'center' }}>
                {t('categories.empty')}
              </Text>
            </View>
          ) : (
            filtered.map((category, i) => (
              <CategoryRow
                key={category.id}
                category={category}
                last={i === filtered.length - 1}
              />
            ))
          )}
        </View>

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('categories.groups.custom')}
        </SectionLabel>
        <CustomCategoriesUpsell />

        <Text
          variant="caption"
          muted
          style={{
            fontSize: 11,
            lineHeight: 16,
            textAlign: 'center',
            marginTop: 18,
          }}
        >
          {t('categories.footer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

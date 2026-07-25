import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { FilterChip, Text } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import {
  monthName,
  monthRange,
  shiftMonth,
  toIsoDate,
} from '@/shared/presentation/utils/dates';

import { emptyFilters, hasActiveFilters, type MovementsFilters } from '../../application';
import type { MovementType } from '../../domain';
import { DayGroup } from '../components/DayGroup';
import { EmptyState } from '../components/EmptyState';
import { MovementsHeader } from '../components/MovementsHeader';
import { SearchBar } from '../components/SearchBar';
import { useMovementCatalogs } from '../hooks/useMovementCatalogs';
import { useMovements } from '../hooks/useMovements';
import { filterMovements } from '../utils/filterMovements';
import { groupByDay } from '../utils/groupByDay';

/** How many months back the picker offers. */
const MONTHS_BACK = 6;

export function MovementsScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const tabBarClearance = useFloatingTabBarClearance();
  const currency = useCurrencyStore((s) => s.currency);
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  // Pinned once per mount: every date label and range is derived from it, so the
  // screen never disagrees with itself mid-render.
  const [today] = useState(() => toIsoDate(new Date()));
  const [filters, setFilters] = useState<MovementsFilters>(emptyFilters);

  const month = filters.month ?? today;
  const range = useMemo(() => monthRange(month), [month]);
  const { data, isLoading, isError, refetch } = useMovements(range);
  const catalogs = useMovementCatalogs();

  const monthOptions = useMemo(
    () =>
      Array.from({ length: MONTHS_BACK }, (_, index) => {
        const iso = shiftMonth(today, -(index + 1));
        return { value: iso, label: monthName(iso, language) };
      }),
    [today, language],
  );

  const { groups, count, monthTotal } = useMemo(() => {
    const movements = data ?? [];
    const filtered = filterMovements(movements, filters, catalogs);
    return {
      groups: groupByDay(filtered, today, language, {
        today: t('movements.days.today'),
        yesterday: t('movements.days.yesterday'),
      }),
      count: filtered.length,
      monthTotal: filtered.reduce(
        (sum, movement) =>
          movement.type === 'expense'
            ? sum - movement.amount
            : movement.type === 'income'
              ? sum + movement.amount
              : sum,
        0,
      ),
    };
  }, [data, filters, catalogs, today, language, t]);

  if (isError) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
        edges={['top']}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            gap: 16,
          }}
        >
          <Text variant="body" muted style={{ fontSize: 14, textAlign: 'center' }}>
            {t('movements.error.title')}
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
              {t('movements.error.retry')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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

  const sourceOptions = Object.values(catalogs.sourceById).map((source) => ({
    value: source.id,
    label: source.name,
  }));
  const categoryOptions = Object.values(catalogs.categoryById).map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const typeOptions: { value: MovementType; label: string }[] = [
    { value: 'expense', label: t('movements.types.expenses') },
    { value: 'income', label: t('movements.types.income') },
    { value: 'transfer', label: t('movements.types.transfers') },
  ];

  const active = hasActiveFilters(filters);

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
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 16 }}>
          <MovementsHeader
            monthLabel={monthName(month, language)}
            monthTotal={monthTotal}
            currency={currency}
            onAvatarPress={() => router.push('/profile')}
          />

          <SearchBar
            value={filters.query}
            onChangeText={(query) => setFilters((f) => ({ ...f, query }))}
            placeholder={t('movements.searchPlaceholder')}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <FilterChip
              label={t('movements.filters.month')}
              value={filters.month}
              onChange={(value) => setFilters((f) => ({ ...f, month: value }))}
              options={monthOptions}
              allLabel={t('movements.filters.monthAll')}
            />
            <FilterChip
              label={t('movements.filters.account')}
              value={filters.sourceId}
              onChange={(sourceId) => setFilters((f) => ({ ...f, sourceId }))}
              options={sourceOptions}
            />
            <FilterChip
              label={t('movements.filters.category')}
              value={filters.categoryId}
              onChange={(categoryId) => setFilters((f) => ({ ...f, categoryId }))}
              options={categoryOptions}
            />
            <FilterChip
              label={t('movements.filters.type')}
              value={filters.type}
              onChange={(value) =>
                setFilters((f) => ({ ...f, type: value as MovementType | null }))
              }
              options={typeOptions}
            />
          </View>

          {active ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 4,
              }}
            >
              <Text variant="caption" muted>
                {t(count === 1 ? 'movements.resultsOne' : 'movements.results', { count })}
              </Text>
              <Pressable
                onPress={() => setFilters((f) => ({ ...emptyFilters, month: f.month }))}
                hitSlop={6}
              >
                <Text
                  variant="label"
                  color={theme.colors.accentMint}
                  style={{ fontSize: 11.5 }}
                >
                  {t('movements.clear')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {groups.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={{ gap: 18 }}>
              {groups.map((group) => (
                <DayGroup
                  key={group.date}
                  group={group}
                  catalogs={catalogs}
                  currency={currency}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

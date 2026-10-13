import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import {
  FilterChip,
  RetryState,
  SubScreenHeader,
  Text,
  Toast,
  Aurora,
} from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import {
  capitalized,
  monthName,
  monthRange,
  shiftMonth,
  toIsoDate,
} from '@/shared/presentation/utils/dates';

import { emptyFilters, hasActiveFilters, type MovementsFilters } from '../../application';
import type { Movement, MovementPatch, MovementType } from '../../domain';
import { DayGroup } from '../components/DayGroup';
import { EmptyState } from '../components/EmptyState';
import { MovementDetailSheet } from '../components/MovementDetailSheet';
import { RhythmStrip } from '@/modules/home/presentation/components/RhythmStrip';
import { useHomeOverview } from '@/modules/home/presentation/hooks/useHomeOverview';

import { MovementsHeader } from '../components/MovementsHeader';
import { SearchBar } from '../components/SearchBar';
import { useMovementCatalogs } from '../hooks/useMovementCatalogs';
import { useDeleteMovement, useUpdateMovement } from '../hooks/useMovementMutations';
import { useMovements } from '../hooks/useMovements';
import { filterMovements } from '../utils/filterMovements';
import { groupByDay } from '../utils/groupByDay';

/** How many months back the picker offers. */
const MONTHS_BACK = 6;

type Props = {
  /**
   * Renders the screen as a sub-screen of ONE source instead of the tab.
   *
   * This exists because a tab cannot be gone back from: pushing `/movements`
   * from Accounts does not stack anything — expo-router returns to the tabs
   * already sitting underneath and swaps the active one, dismissing Accounts
   * and leaving nothing to pop. A source's movements are a place you arrive
   * *from* somewhere, so they get their own stack route and a back button.
   */
  scopedSourceId?: string;
};

export function MovementsScreen({ scopedSourceId }: Props = {}) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const tabBarClearance = useFloatingTabBarClearance();
  const currency = useCurrencyStore((s) => s.currency);
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  // Pinned once per mount: every date label and range is derived from it, so the
  // screen never disagrees with itself mid-render.
  const [today] = useState(() => toIsoDate(new Date()));
  const overview = useHomeOverview(today);
  const [filters, setFilters] = useState<MovementsFilters>(() =>
    scopedSourceId ? { ...emptyFilters, sourceId: scopedSourceId } : emptyFilters,
  );
  const [detail, setDetail] = useState<Movement | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const updateMovement = useUpdateMovement();
  const deleteMovement = useDeleteMovement();

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
      <Aurora>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <RetryState
            titleKey="movements.error.title"
            retryKey="movements.error.retry"
            onRetry={() => void refetch()}
          />
        </SafeAreaView>
      </Aurora>
    );
  }

  if (isLoading || !data) {
    return (
      <Aurora style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.palette.acc} />
      </Aurora>
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

  // The scope is not one of the user's filters, so it must not light up
  // "Limpiar" — a clear button with nothing to clear is a dead affordance.
  const active = hasActiveFilters(
    scopedSourceId ? { ...filters, sourceId: null } : filters,
  );

  const handleSave = (patch: MovementPatch) => {
    if (!detail) return;
    updateMovement.mutate(
      { id: detail.id, patch },
      {
        onSuccess: () => setDetail(null),
        onError: () => setToast(t('movements.errors.saveFailed')),
      },
    );
  };

  const handleDelete = () => {
    if (!detail) return;
    deleteMovement.mutate(detail.id, {
      onSuccess: () => setDetail(null),
      onError: () => setToast(t('movements.errors.deleteFailed')),
    });
  };

  return (
    <Aurora>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 14,
            // Pushed over the tabs there is no floating bar to clear.
            paddingBottom: scopedSourceId ? 32 : tabBarClearance,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 16 }}>
            {scopedSourceId ? (
              <SubScreenHeader
                title={catalogs.sourceById[scopedSourceId]?.name ?? t('movements.title')}
                onBack={() => router.back()}
              />
            ) : (
              <MovementsHeader
                monthLabel={capitalized(monthName(month, language))}
                monthTotal={monthTotal}
                currency={currency}
              />
            )}

            {/* The same strip Home draws, from the same read. Computing it here
              from the filtered list would let the two screens disagree about
              the same month. */}
            {scopedSourceId || !overview.data ? null : (
              <RhythmStrip
                compact
                byDay={overview.data.byDay}
                spentToday={overview.data.month.spentToday}
                dailyAverage={overview.data.pace?.dailyAverage ?? null}
                language={language}
              />
            )}

            <SearchBar
              value={filters.query}
              onChangeText={(query) => setFilters((f) => ({ ...f, query }))}
              placeholder={t('movements.searchPlaceholder')}
            />

            {/* The bundle lays four chips across the width. Real labels are longer
              than its mock ones — "Restaurantes", "Bancolombia" — so the row
              scrolls instead of squeezing them into ellipsis. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 7, paddingRight: 8 }}
            >
              <FilterChip
                label={t('movements.filters.month')}
                value={filters.month}
                onChange={(value) => setFilters((f) => ({ ...f, month: value }))}
                options={monthOptions}
                allLabel={t('movements.filters.monthAll')}
              />
              <FilterChip
                label={t('movements.filters.category')}
                value={filters.categoryId}
                onChange={(categoryId) => setFilters((f) => ({ ...f, categoryId }))}
                options={categoryOptions}
              />
              {/* Scoped to one source, the source is not a filter — it is the
                screen. Offering it as a chip would let the user "clear" their
                way out of the very thing they opened. */}
              {scopedSourceId ? null : (
                <FilterChip
                  label={t('movements.filters.account')}
                  value={filters.sourceId}
                  onChange={(sourceId) => setFilters((f) => ({ ...f, sourceId }))}
                  options={sourceOptions}
                />
              )}
              <FilterChip
                label={t('movements.filters.type')}
                value={filters.type}
                onChange={(value) =>
                  setFilters((f) => ({ ...f, type: value as MovementType | null }))
                }
                options={typeOptions}
              />
            </ScrollView>

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
                  {t(count === 1 ? 'movements.resultsOne' : 'movements.results', {
                    count,
                  })}
                </Text>
                <Pressable
                  onPress={() =>
                    setFilters((f) => ({
                      ...emptyFilters,
                      month: f.month,
                      // The scope survives "Limpiar" — clearing your way out of
                      // the screen you just opened is not clearing, it is a bug.
                      sourceId: scopedSourceId ?? null,
                    }))
                  }
                  hitSlop={6}
                >
                  <Text
                    variant="label"
                    color={theme.palette.acc3}
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
                    onItemPress={setDetail}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <MovementDetailSheet
          visible={detail !== null}
          movement={detail}
          catalogs={catalogs}
          submitting={updateMovement.isPending || deleteMovement.isPending}
          onClose={() => setDetail(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        <Toast
          visible={toast !== null}
          message={toast ?? ''}
          onDismiss={() => setToast(null)}
        />
      </SafeAreaView>
    </Aurora>
  );
}

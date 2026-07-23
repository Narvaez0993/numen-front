import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip, Text } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';

import {
  emptyFilters,
  hasActiveFilters,
  type MovementsFilters,
  type MovementsTypeFilter,
} from '../../application/dto/MovementsFilters';
import type { Transaction } from '../../domain/types/Transaction';
import { DayGroup } from '../components/DayGroup';
import { EmptyState } from '../components/EmptyState';
import { MovementsHeader } from '../components/MovementsHeader';
import { SearchBar } from '../components/SearchBar';
import { TxDetailSheet } from '../components/TxDetailSheet';
import { useMovements } from '../hooks/useMovements';
import { useMovementsStore } from '../stores/useMovementsStore';
import { filterTransactions } from '../utils/filterTransactions';
import { groupByDay } from '../utils/groupByDay';

export function MovementsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data } = useMovements();
  const [filters, setFilters] = useState<MovementsFilters>(emptyFilters);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const tabBarClearance = useFloatingTabBarClearance();

  const initialized = useMovementsStore((s) => s.initialized);
  const init = useMovementsStore((s) => s.init);
  const transactions = useMovementsStore((s) => s.transactions);
  const updateTransaction = useMovementsStore((s) => s.updateTransaction);
  const removeTransaction = useMovementsStore((s) => s.removeTransaction);

  useEffect(() => {
    if (data && !initialized) init(data.transactions);
  }, [data, initialized, init]);

  const { groups, count, monthTotal } = useMemo(() => {
    if (!data || !initialized) return { groups: [], count: 0, monthTotal: 0 };
    const filtered = filterTransactions(transactions, filters, {
      categories: data.categories,
      accounts: data.accounts,
    });
    const total = filtered
      .filter((tx) => tx.tag !== 'transfer' && tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      groups: groupByDay(filtered),
      count: filtered.length,
      monthTotal: total,
    };
  }, [data, initialized, transactions, filters]);

  if (!data || !initialized) {
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

  const accountOptions = Object.values(data.accounts).map((a) => ({
    value: a.id,
    label: a.name,
  }));
  const categoryOptions = Object.values(data.categories)
    .filter((c) => c.id !== 'transfer')
    .map((c) => ({ value: c.id, label: c.name }));
  const typeOptions: { value: MovementsTypeFilter; label: string }[] = [
    { value: 'gasto', label: t('movements.types.expenses') },
    { value: 'ingreso', label: t('movements.types.income') },
    { value: 'recurrente', label: t('movements.types.recurring') },
    { value: 'transfer', label: t('movements.types.transfers') },
  ];
  const monthOptions = [
    { value: 'abril', label: t('movements.months.april') },
    { value: 'marzo', label: t('movements.months.march') },
    { value: '90d', label: t('movements.months.last90') },
    { value: 'year', label: t('movements.months.thisYear') },
  ];

  const active = hasActiveFilters(filters);

  const handleSaveDetail = (patch: Parameters<typeof updateTransaction>[1]) => {
    if (detailTx) updateTransaction(detailTx.id, patch);
    setDetailTx(null);
  };

  const handleDeleteDetail = () => {
    if (detailTx) removeTransaction(detailTx.id);
    setDetailTx(null);
  };

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
            monthLabel={t('movements.currentMonth')}
            monthTotal={monthTotal}
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
              onChange={(month) => setFilters((f) => ({ ...f, month }))}
              options={monthOptions}
              allLabel={t('movements.filters.monthAll')}
            />
            <FilterChip
              label={t('movements.filters.account')}
              value={filters.accountId}
              onChange={(accountId) => setFilters((f) => ({ ...f, accountId }))}
              options={accountOptions}
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
                setFilters((f) => ({ ...f, type: value as MovementsTypeFilter | null }))
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
              <Pressable onPress={() => setFilters(emptyFilters)} hitSlop={6}>
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
              {groups.map((g) => (
                <DayGroup
                  key={g.date}
                  group={g}
                  categories={data.categories}
                  accounts={data.accounts}
                  onItemPress={setDetailTx}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TxDetailSheet
        visible={detailTx !== null}
        tx={detailTx}
        categories={data.categories}
        accounts={data.accounts}
        onClose={() => setDetailTx(null)}
        onSave={handleSaveDetail}
        onDelete={handleDeleteDetail}
      />
    </SafeAreaView>
  );
}

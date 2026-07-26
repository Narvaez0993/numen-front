import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { useMovementsSummary } from '@/modules/movements/presentation/hooks/useMovementsSummary';
import {
  Icon,
  SectionLabel,
  SubScreenHeader,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthRange, toIsoDate } from '@/shared/presentation/utils/dates';

import { CategoryNameTakenError, type Category } from '../../domain';

import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '../components/CategoryFormSheet';
import { CategoryRow } from '../components/CategoryRow';
import { CategorySearchBar } from '../components/CategorySearchBar';
import { CustomCategoriesUpsell } from '../components/CustomCategoriesUpsell';
import { ThisMonthCard } from '../components/ThisMonthCard';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { filterCategories } from '../utils/filterCategories';
import { joinCategorySpend } from '../utils/joinCategorySpend';

const FREE_CUSTOM_LIMIT = 2;

type Sheet = { mode: 'create' } | { mode: 'edit'; category: Category };

export function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCategories();
  // The month is pinned once per mount: a re-render must not move the range.
  const month = useMemo(() => monthRange(toIsoDate(new Date())), []);
  const summary = useMovementsSummary(month);
  const tier = useAuthStore((s) => s.session?.tier);

  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  // The catalog says which categories exist; the summary, what they cost this
  // month. Neither knows about the other until here.
  const categories = useMemo(
    () => joinCategorySpend(data ?? [], summary.data?.byCategory ?? []),
    [data, summary.data],
  );

  const standard = useMemo(
    () =>
      [
        ...filterCategories(
          query,
          categories.filter((c) => c.isStandard),
        ),
      ].sort((a, b) => b.spent - a.spent),
    [query, categories],
  );

  const custom = useMemo(
    () =>
      filterCategories(
        query,
        categories.filter((c) => !c.isStandard),
      ),
    [query, categories],
  );

  const customCount = categories.filter((c) => !c.isStandard).length;
  const atLimit = tier !== 'plus' && customCount >= FREE_CUSTOM_LIMIT;
  const submitting = create.isPending || update.isPending;

  const closeSheet = () => {
    setSheet(null);
    setFormError(null);
  };

  const handleFormError = (error: Error) => {
    setFormError(
      error instanceof CategoryNameTakenError
        ? t('categories.form.errors.nameTaken')
        : t('categories.form.errors.generic'),
    );
  };

  const handleSubmit = (values: CategoryFormValues) => {
    setFormError(null);
    if (sheet?.mode === 'edit') {
      update.mutate(
        {
          id: sheet.category.id,
          patch: { name: values.name, icon: values.icon, color: values.color },
        },
        { onSuccess: closeSheet, onError: handleFormError },
      );
    } else {
      create.mutate(values, { onSuccess: closeSheet, onError: handleFormError });
    }
  };

  const handleDelete = () => {
    if (sheet?.mode !== 'edit') return;
    remove.mutate(sheet.category.id, {
      onSuccess: closeSheet,
      onError: () => setToast(t('categories.form.errors.deleteFailed')),
    });
  };

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <SubScreenHeader title={t('categories.title')} onBack={() => router.back()} />
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
            {t('categories.error.title')}
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
              {t('categories.error.retry')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // The summary is part of the first paint: showing $0 and correcting it a moment
  // later reads as "you spent nothing this month".
  if (isLoading || !data || summary.isLoading) {
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

  const groupBox = {
    backgroundColor: theme.colors.bgSurface,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  };

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
          // The month total, unclassified spend included, so it matches Home.
          totalSpent={summary.data?.expenseTotal ?? 0}
          activeCount={categories.filter((c) => c.count > 0).length}
          totalCount={categories.length}
        />

        <CategorySearchBar value={query} onChange={setQuery} />

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('categories.groups.standard', { count: standard.length })}
        </SectionLabel>
        <View style={[groupBox, { marginBottom: 18 }]}>
          {standard.length === 0 ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
              <Text variant="body" muted style={{ fontSize: 13, textAlign: 'center' }}>
                {t('categories.empty')}
              </Text>
            </View>
          ) : (
            standard.map((category, i) => (
              <CategoryRow
                key={category.id}
                category={category}
                last={i === standard.length - 1}
              />
            ))
          )}
        </View>

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('categories.groups.custom')}
        </SectionLabel>

        {custom.length > 0 ? (
          <View style={[groupBox, { marginBottom: 10 }]}>
            {custom.map((category, i) => (
              <CategoryRow
                key={category.id}
                category={category}
                last={i === custom.length - 1}
                onPress={() => {
                  setFormError(null);
                  setSheet({ mode: 'edit', category });
                }}
              />
            ))}
          </View>
        ) : null}

        {atLimit ? (
          <CustomCategoriesUpsell />
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setFormError(null);
              setSheet({ mode: 'create' });
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 13,
              borderRadius: 14,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="plus" size={16} color={theme.colors.accentMint} />
            <Text
              variant="label"
              color={theme.colors.accentMint}
              style={{ fontSize: 13 }}
            >
              {t('categories.custom.createButton')}
            </Text>
          </Pressable>
        )}

        <Text
          variant="caption"
          muted
          style={{ fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 18 }}
        >
          {t('categories.footer')}
        </Text>
      </ScrollView>

      <CategoryFormSheet
        visible={sheet !== null}
        initial={sheet?.mode === 'edit' ? sheet.category : null}
        submitting={submitting}
        errorMessage={formError}
        onClose={closeSheet}
        onSubmit={handleSubmit}
        onDelete={sheet?.mode === 'edit' ? handleDelete : undefined}
      />

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
        durationMs={2500}
      />
    </SafeAreaView>
  );
}

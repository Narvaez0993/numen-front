import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import { useBudgets } from '@/modules/budgets/presentation/hooks/useBudgets';
import { useMovementsSummary } from '@/modules/movements/presentation/hooks/useMovementsSummary';
import type { CurrencyCode } from '@/shared/domain';
import {
  Aurora,
  DashedButton,
  Icon,
  RetryState,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';
import { monthRange, toIsoDate } from '@/shared/presentation/utils/dates';

import { CategoryNameTakenError, type Category } from '../../domain';

import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '../components/CategoryFormSheet';
import { CategoryRow } from '../components/CategoryRow';
import { CategorySearchBar } from '../components/CategorySearchBar';
import { useCategories } from '../hooks/useCategories';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { filterCategories } from '../utils/filterCategories';
import { joinCategorySpend } from '../utils/joinCategorySpend';

const FREE_CUSTOM_LIMIT = 2;

type Sheet = { mode: 'create' } | { mode: 'edit'; category: Category };

/**
 * Every category, and what each one cost this month.
 *
 * The redesign folded two lists into one. It used to separate standard from
 * custom, which is a fact about where a category CAME FROM and no help at all
 * in answering the question the screen is opened with — what am I spending on.
 * Now it is one list ordered by that, with the untouched ones stepping back at
 * the end.
 *
 * The plan's capacity moved too, and this is the design's own answer to
 * something that was wrong everywhere: it is stated calmly UNDER the create
 * button, before you press it. The gate used to fire afterwards, as an error,
 * about a rule that had not changed since you opened the screen.
 */
export function CategoriesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currency = useCurrencyStore((s) => s.currency) as CurrencyCode;

  const { data, isLoading, isError, refetch } = useCategories();
  // The month is pinned once per mount: a re-render must not move the range.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const month = useMemo(() => monthRange(today), [today]);
  const summary = useMovementsSummary(month);
  // Only for the caps in each row's subtitle — the numbers themselves come from
  // the summary, exactly as Presupuesto reads them.
  const budgets = useBudgets(today);

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

  const capsByCategory = useMemo(() => {
    const caps: Record<string, { target: number; over: boolean }> = {};
    for (const cap of budgets.data?.categories ?? []) {
      caps[cap.categoryId] = { target: cap.target, over: cap.remaining < 0 };
    }
    return caps;
  }, [budgets.data]);

  /** Most spent first; anything untouched falls to the end, alphabetical. */
  const shown = useMemo(() => {
    const list = filterCategories(query, categories);
    return [...list].sort((a, b) => {
      if (a.count > 0 !== b.count > 0) return a.count > 0 ? -1 : 1;
      if (a.count > 0) return b.spent - a.spent;
      return a.name.localeCompare(b.name);
    });
  }, [query, categories]);

  const customCount = categories.filter((c) => !c.isStandard).length;
  const isPlus = useTier() === 'plus';
  const atLimit = !isPlus && customCount >= FREE_CUSTOM_LIMIT;
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
      return;
    }
    create.mutate(values, { onSuccess: closeSheet, onError: handleFormError });
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
        <RetryState
          titleKey="categories.error.title"
          retryKey="categories.error.retry"
          onRetry={() => void refetch()}
        />
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
        <ActivityIndicator color={theme.palette.acc} />
      </SafeAreaView>
    );
  }

  return (
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 26,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 22,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon
              name="arrow-left"
              size={16}
              stroke={2}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{t('categories.title')}</Text>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
          <CategorySearchBar value={query} onChange={setQuery} />
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 2 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 8,
              gap: 12,
            }}
          >
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.2 }}
            >
              {t('categories.list.label')}
            </Text>
            <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
              {t('categories.list.period')}
            </Text>
          </View>

          {shown.length === 0 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 13, paddingVertical: 26, textAlign: 'center' }}
            >
              {t('categories.empty')}
            </Text>
          ) : (
            shown.map((category, index) => (
              <CategoryRow
                key={category.id}
                category={category}
                target={capsByCategory[category.id]?.target}
                over={capsByCategory[category.id]?.over}
                currency={currency}
                last={index === shown.length - 1}
                // Only the user's own can be renamed; a standard one is a fixed
                // part of the catalog and a tap that opened an uneditable form
                // would be a promise the sheet cannot keep.
                onPress={
                  category.isStandard
                    ? undefined
                    : () => {
                        setFormError(null);
                        setSheet({ mode: 'edit', category });
                      }
                }
              />
            ))
          )}
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
          <DashedButton
            label={t('categories.custom.createButton')}
            onPress={() => {
              setFormError(null);
              setSheet({ mode: 'create' });
            }}
          />
          {/* Said before you press, not after. The gate used to fire as an error
              about a rule that had not changed since the screen opened. */}
          <Text
            color={atLimit ? theme.colors.accentCoralSoft : theme.colors.textTertiary}
            style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}
          >
            {isPlus
              ? t('categories.capacity.plus', { count: customCount })
              : t('categories.capacity.free', {
                  count: customCount,
                  limit: FREE_CUSTOM_LIMIT,
                })}
          </Text>
        </View>
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
    </Aurora>
  );
}

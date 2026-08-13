import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGoals } from '@/modules/goals/presentation/hooks/useGoals';
import { useMovementsSummary } from '@/modules/movements/presentation/hooks/useMovementsSummary';
import { DomainError, type CurrencyCode } from '@/shared/domain';
import { Aurora, DashedButton, RetryState, Text } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, monthRange, toIsoDate } from '@/shared/presentation/utils/dates';

import { BudgetHero } from '../components/BudgetHero';
import { BudgetsHeader } from '../components/BudgetsHeader';
import { EmptyState } from '../components/EmptyState';
import { GoalsLink } from '../components/GoalsLink';
import { ProjectionCallout } from '../components/ProjectionCallout';
import { WatchedRow } from '../components/WatchedRow';
import { BudgetCreateFlow } from '../components/create-flow/BudgetCreateFlow';
import { AddVigilanceSheet } from '../components/sheets/AddVigilanceSheet';
import { ConfirmSheet } from '../components/sheets/ConfirmSheet';
import { EditTechoSheet } from '../components/sheets/EditTechoSheet';
import { EditTopeSheet } from '../components/sheets/EditTopeSheet';
import {
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '../hooks/useBudgetMutations';
import { useBudgets } from '../hooks/useBudgets';
import {
  type CandidateCategory,
  type WatchedCategory,
  useWatchedCategories,
} from '../hooks/useWatchedCategories';

/** What the tope sheet is open for: a cap being edited, or a category being picked up. */
type TopeEdit =
  | { kind: 'edit'; category: WatchedCategory }
  | { kind: 'new'; category: CandidateCategory };

type Confirm = { kind: 'techo' } | { kind: 'tope'; budgetId: string; name: string };

const COPY_BY_CODE: Record<string, string> = {
  'budgets.limit_reached': 'budgets.limitReached',
  'budgets.already_exists': 'budgets.alreadyExists',
};

// Time to wait for one BottomSheet to fully close before opening another.
// React Native only supports a single visible Modal at a time on iOS — opening
// one while another is still dismissing silently no-ops. Matches BottomSheet's
// 240ms close animation + a small buffer.
const SHEET_CLOSE_MS = 280;

/**
 * Presupuestos, running on the API.
 *
 * Nothing is held here: the snapshot is the state and each sheet calls its
 * mutation. The three states are read off that snapshot rather than tracked —
 * **A** no ceiling · **B** a ceiling with nothing watched · **C** both.
 *
 * The redesign changed what the screen leads with. It used to open with the
 * app's name and an avatar; now the month is the title and the ceiling sits
 * opposite it, because those are the two things every other number on the page
 * is relative to. Under them the remaining balance at 45px, and a bar that marks
 * where the month itself has got to — which is what turns "68% used" from a fact
 * into a verdict.
 *
 * Watched categories became rows with a rule between them instead of expandable
 * cards. Four cards read as four things each asking for attention; four rows
 * read as a list, and a list is scannable, which is the entire job: notice the
 * one misbehaving without reading the other three.
 */
export function BudgetsScreen() {
  const tabBarClearance = useFloatingTabBarClearance();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  // Pinned once per mount: a re-render must not move what "today" means, and the
  // daily ceiling divides by the days that are left.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const month = useMemo(() => monthRange(today), [today]);

  const { data, isLoading, isError, refetch } = useBudgets(today);
  // Already cached by the categories screen for the same range: it is what tells
  // the "watch a category" sheet how much each candidate has cost this month.
  const summary = useMovementsSummary(month);
  const goals = useGoals(today);

  const spentByCategory = useMemo(() => {
    const spend: Record<string, number> = {};
    for (const row of summary.data?.byCategory ?? []) {
      if (row.categoryId) spend[row.categoryId] = row.spent;
    }
    return spend;
  }, [summary.data]);

  const { watched, candidates } = useWatchedCategories(
    data?.categories ?? [],
    spentByCategory,
  );

  const createBudget = useCreateBudget(today);
  const updateBudget = useUpdateBudget(today);
  const deleteBudget = useDeleteBudget();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTechoOpen, setEditTechoOpen] = useState(false);
  const [topeEdit, setTopeEdit] = useState<TopeEdit | null>(null);
  const [addVigOpen, setAddVigOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <RetryState
          titleKey="budgets.error.title"
          retryKey="budgets.error.retry"
          onRetry={() => void refetch()}
        />
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
        <ActivityIndicator color={theme.palette.acc} />
      </SafeAreaView>
    );
  }

  const currency = data.currency as CurrencyCode;
  const name = monthName(`${data.period}-01`, i18n.language);
  const state: 'A' | 'B' | 'C' =
    data.month === null ? 'A' : watched.length === 0 ? 'B' : 'C';

  const activeGoals = (goals.data?.goals ?? []).filter((goal) => !goal.archived);
  const savedTotal = activeGoals.reduce((sum, goal) => sum + goal.saved, 0);

  const report = (error: unknown) => {
    // The two failures the user can actually do something about get their own
    // copy; the server's English message is a last resort.
    const key = error instanceof DomainError ? COPY_BY_CODE[error.code] : undefined;
    if (key) {
      setFailed(t(key));
      return;
    }
    setFailed(error instanceof Error ? error.message : t('common.error'));
  };

  const handleCreate = async (techo: number, topes: Record<string, number>) => {
    setFailed(null);
    setCreateOpen(false);
    try {
      await createBudget.mutateAsync({ scope: 'global', target: techo });
      // Sequential on purpose: the Free gate counts what is already there, so two
      // caps racing could both read "one watched" and slip past it.
      for (const [categoryId, target] of Object.entries(topes)) {
        await createBudget.mutateAsync({ scope: 'category', categoryId, target });
      }
    } catch (error) {
      report(error);
    }
  };

  const handleSaveTecho = async (amount: number) => {
    setFailed(null);
    setEditTechoOpen(false);
    try {
      if (data.month) {
        await updateBudget.mutateAsync({ id: data.month.id, target: amount });
      } else {
        await createBudget.mutateAsync({ scope: 'global', target: amount });
      }
    } catch (error) {
      report(error);
    }
  };

  const handleSaveTope = async (amount: number) => {
    if (!topeEdit) return;
    const edit = topeEdit;
    setFailed(null);
    setTopeEdit(null);
    try {
      if (edit.kind === 'edit') {
        // The cap's own id, not the category's: this is an edit of the row.
        await updateBudget.mutateAsync({ id: edit.category.id, target: amount });
      } else {
        await createBudget.mutateAsync({
          scope: 'category',
          categoryId: edit.category.id,
          target: amount,
        });
      }
    } catch (error) {
      report(error);
    }
  };

  const requestDeleteTope = () => {
    if (topeEdit?.kind !== 'edit') return;
    const { id, name: categoryName } = topeEdit.category;
    setTopeEdit(null);
    setTimeout(
      () => setConfirm({ kind: 'tope', budgetId: id, name: categoryName }),
      SHEET_CLOSE_MS,
    );
  };

  const requestDeleteTecho = () => {
    setEditTechoOpen(false);
    setTimeout(() => setConfirm({ kind: 'techo' }), SHEET_CLOSE_MS);
  };

  const confirmDelete = async () => {
    if (!confirm) return;
    const target = confirm.kind === 'techo' ? data.month?.id : confirm.budgetId;
    setConfirm(null);
    if (!target) return;
    setFailed(null);
    try {
      await deleteBudget.mutateAsync(target);
    } catch (error) {
      report(error);
    }
  };

  const handlePickVigilance = (category: CandidateCategory) => {
    setAddVigOpen(false);
    setTimeout(() => setTopeEdit({ kind: 'new', category }), SHEET_CLOSE_MS);
  };

  const confirmCopy = {
    title:
      confirm?.kind === 'techo'
        ? t('budgets.confirmSheet.techoTitle', { month: name })
        : confirm?.kind === 'tope'
          ? t('budgets.confirmSheet.topeTitle', { name: confirm.name })
          : '',
    body:
      confirm?.kind === 'techo'
        ? t('budgets.confirmSheet.techoBody')
        : t('budgets.confirmSheet.topeBody'),
    cta:
      confirm?.kind === 'techo'
        ? t('budgets.confirmSheet.techoCta')
        : t('budgets.confirmSheet.topeCta'),
  };

  return (
    // `Aurora` WRAPS — it is a flex:1 container that paints the blooms behind its
    // children, not a backdrop layer. Rendered as a sibling it takes half the
    // screen and leaves the scroll the other half.
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: tabBarClearance + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24 }}>
          <BudgetsHeader
            monthName={name}
            target={data.month?.target ?? null}
            currency={currency}
            onEditCeiling={() => setEditTechoOpen(true)}
          />
        </View>

        {failed && (
          <Text
            color={theme.colors.accentCoral}
            style={{ fontSize: 12, paddingHorizontal: 26, paddingTop: 14 }}
          >
            {failed}
          </Text>
        )}

        {state === 'A' && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <EmptyState onCreate={() => setCreateOpen(true)} />
          </View>
        )}

        {data.month && (
          <>
            <View style={{ paddingHorizontal: 26, paddingTop: 24 }}>
              <BudgetHero
                cap={data.month}
                currency={currency}
                daysElapsed={data.daysElapsed}
                daysLeft={data.daysLeft}
              />
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
              <ProjectionCallout cap={data.month} currency={currency} />
            </View>

            <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <Text
                  variant="micro"
                  uppercase
                  color={theme.colors.textTertiary}
                  style={{ letterSpacing: 2.2 }}
                >
                  {t('budgets.watched')}
                </Text>
                <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
                  {t('budgets.watchedCount', { count: watched.length })}
                </Text>
              </View>

              {watched.map((category, index) => (
                <WatchedRow
                  key={category.id}
                  name={category.name}
                  icon={category.icon}
                  spent={category.spent}
                  target={category.target}
                  used={category.used}
                  currency={currency}
                  last={index === watched.length - 1}
                  onPress={() => setTopeEdit({ kind: 'edit', category })}
                />
              ))}
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 14, gap: 6 }}>
              <DashedButton
                label={t(state === 'B' ? 'budgets.emptyB.cta' : 'budgets.addCategory')}
                onPress={() => setAddVigOpen(true)}
              />
              <GoalsLink
                active={activeGoals.length}
                saved={savedTotal}
                currency={currency}
                onPress={() => router.push('/goals')}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Sheets */}
      <BudgetCreateFlow
        visible={createOpen}
        categories={candidates}
        monthName={name}
        saving={createBudget.isPending}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />

      <EditTechoSheet
        visible={editTechoOpen}
        current={data.month?.target ?? null}
        monthName={name}
        saving={updateBudget.isPending}
        onClose={() => setEditTechoOpen(false)}
        onSave={handleSaveTecho}
        onDelete={requestDeleteTecho}
      />

      <EditTopeSheet
        visible={topeEdit != null}
        category={
          topeEdit
            ? {
                categoryId:
                  topeEdit.kind === 'edit'
                    ? topeEdit.category.categoryId
                    : topeEdit.category.id,
                name: topeEdit.category.name,
                icon: topeEdit.category.icon,
                color: topeEdit.category.color,
                spent: topeEdit.category.spent,
              }
            : null
        }
        current={topeEdit?.kind === 'edit' ? topeEdit.category.target : 0}
        saving={createBudget.isPending || updateBudget.isPending}
        onClose={() => setTopeEdit(null)}
        onSave={handleSaveTope}
        onDelete={topeEdit?.kind === 'edit' ? requestDeleteTope : undefined}
      />

      <AddVigilanceSheet
        visible={addVigOpen}
        candidates={candidates}
        onClose={() => setAddVigOpen(false)}
        onPick={handlePickVigilance}
      />

      <ConfirmSheet
        visible={confirm != null}
        title={confirmCopy.title}
        body={confirmCopy.body}
        confirmLabel={confirmCopy.cta}
        onConfirm={confirmDelete}
        onClose={() => setConfirm(null)}
      />
    </Aurora>
  );
}

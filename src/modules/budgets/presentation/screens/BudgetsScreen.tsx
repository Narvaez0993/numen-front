import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMovementsSummary } from '@/modules/movements/presentation/hooks/useMovementsSummary';
import { DomainError } from '@/shared/domain';
import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, monthRange, toIsoDate } from '@/shared/presentation/utils/dates';

import { BudgetsHeader } from '../components/BudgetsHeader';
import { CategoryItem } from '../components/CategoryItem';
import { DashedButton } from '../components/DashedButton';
import { EmptyState } from '../components/EmptyState';
import { EmptyVigilanceCard } from '../components/EmptyVigilanceCard';
import { GhostMintButton } from '../components/GhostMintButton';
import { MonthHero } from '../components/MonthHero';
import { ProjectionCallout } from '../components/ProjectionCallout';
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
 * It used to keep every cap in a zustand store, which meant a user could set a ceiling,
 * watch the whole screen react to it, and lose all of it on the next reload. Nothing is
 * held here now: the snapshot is the state and each sheet calls its mutation.
 *
 * The three states are read off that snapshot rather than tracked:
 * **A** no ceiling · **B** a ceiling with nothing watched · **C** both.
 */
export function BudgetsScreen() {
  const tabBarClearance = useFloatingTabBarClearance();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  // Pinned once per mount: a re-render must not move what "today" means, and the daily
  // ceiling divides by the days that are left.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const month = useMemo(() => monthRange(today), [today]);

  const { data, isLoading } = useBudgets(today);
  // Already cached by the categories screen for the same range: it is what tells the
  // "watch a category" sheet how much each candidate has cost this month.
  const summary = useMovementsSummary(month);

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

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTechoOpen, setEditTechoOpen] = useState(false);
  const [topeEdit, setTopeEdit] = useState<TopeEdit | null>(null);
  const [addVigOpen, setAddVigOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

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

  const name = monthName(`${data.period}-01`, i18n.language);
  const state: 'A' | 'B' | 'C' =
    data.month === null ? 'A' : watched.length === 0 ? 'B' : 'C';

  const report = (error: unknown) => {
    // The two failures the user can actually do something about get their own copy; the
    // server's English message is a last resort, not the thing to show a Spanish user.
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
      // Sequential on purpose: the Free gate counts what is already there, so two caps
      // racing could both read "one watched" and slip past it.
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
    setExpandedId(null);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: tabBarClearance + 40,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 16 }}>
          <BudgetsHeader
            onAvatarPress={() => router.push('/profile')}
            subtitle={
              state === 'A'
                ? t('budgets.noActiveBudget')
                : t('budgets.subtitle', { month: name })
            }
          />

          {failed && (
            <Text
              variant="caption"
              color={theme.colors.accentCoral}
              style={{ fontSize: 12, paddingHorizontal: 4 }}
            >
              {failed}
            </Text>
          )}

          {state === 'A' && <EmptyState onCreate={() => setCreateOpen(true)} />}

          {data.month && (
            <>
              <MonthHero
                month={data.month}
                monthName={name}
                daysLeft={data.daysLeft}
                onPress={() => setEditTechoOpen(true)}
              />
              <ProjectionCallout cap={data.month} />

              {state === 'B' && (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingHorizontal: 4,
                      marginBottom: 10,
                      gap: 12,
                    }}
                  >
                    <SectionLabel>{t('budgets.emptyB.title')}</SectionLabel>
                    <Text variant="micro" muted style={{ fontSize: 10.5 }}>
                      {t('budgets.urgencyOrder')}
                    </Text>
                  </View>
                  <View style={{ gap: 10 }}>
                    <EmptyVigilanceCard />
                    <GhostMintButton
                      icon="plus"
                      label={t('budgets.emptyB.cta')}
                      onPress={() => setAddVigOpen(true)}
                    />
                  </View>
                </View>
              )}

              {state === 'C' && (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingHorizontal: 4,
                      marginBottom: 10,
                      gap: 12,
                    }}
                  >
                    <SectionLabel>{t('budgets.byCategory')}</SectionLabel>
                    <Text variant="micro" muted style={{ fontSize: 10.5 }}>
                      {t('budgets.urgencyOrder')}
                    </Text>
                  </View>
                  <View style={{ gap: 10 }}>
                    {watched.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        expanded={expandedId === category.id}
                        onToggle={() =>
                          setExpandedId((id) => (id === category.id ? null : category.id))
                        }
                        onEdit={() => setTopeEdit({ kind: 'edit', category })}
                        onViewAll={() =>
                          router.push({
                            pathname: '/(tabs)/movements',
                            params: { categoryId: category.categoryId },
                          })
                        }
                      />
                    ))}
                    <DashedButton
                      icon="plus"
                      label={t('budgets.addCategory')}
                      onPress={() => setAddVigOpen(true)}
                    />
                  </View>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.colors.accentPurpleBg,
                }}
              >
                <Icon name="sparkles" size={14} color={theme.colors.accentPurple} />
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}
                >
                  {t('budgets.plusUpsell.text')}{' '}
                  <Text
                    variant="caption"
                    color={theme.colors.accentPurple}
                    style={{ fontWeight: '500', fontSize: 11.5 }}
                  >
                    {t('budgets.plusUpsell.label')}
                  </Text>
                </Text>
                <Pressable hitSlop={6} onPress={() => router.push('/plan')}>
                  <Text
                    variant="label"
                    color={theme.colors.accentPurple}
                    style={{ fontSize: 11.5 }}
                  >
                    {t('budgets.plusUpsell.cta')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
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
    </SafeAreaView>
  );
}

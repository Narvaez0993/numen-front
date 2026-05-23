import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

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
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetsConfigStore } from '../stores/useBudgetsConfigStore';

import type { CategoryBudget } from '../../domain/types/Budget';

type Confirm = { kind: 'techo' } | { kind: 'tope'; catId: string };

// Time to wait for one BottomSheet to fully close before opening another.
// React Native only supports a single visible Modal at a time on iOS — opening
// one while another is still dismissing silently no-ops. Matches BottomSheet's
// 240ms close animation + a small buffer.
const SHEET_CLOSE_MS = 280;

export function BudgetsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useBudgets();

  const initialized = useBudgetsConfigStore((s) => s.initialized);
  const techo = useBudgetsConfigStore((s) => s.techo);
  const topes = useBudgetsConfigStore((s) => s.topes);
  const customCategories = useBudgetsConfigStore((s) => s.customCategories);
  const initFromSnapshot = useBudgetsConfigStore((s) => s.initFromSnapshot);
  const setTechoValue = useBudgetsConfigStore((s) => s.setTecho);
  const deleteTechoValue = useBudgetsConfigStore((s) => s.deleteTecho);
  const setTopeValue = useBudgetsConfigStore((s) => s.setTope);
  const deleteTopeValue = useBudgetsConfigStore((s) => s.deleteTope);
  const setTopesValue = useBudgetsConfigStore((s) => s.setTopes);
  const addCustomCategory = useBudgetsConfigStore((s) => s.addCustomCategory);

  useEffect(() => {
    if (data && !initialized) initFromSnapshot(data);
  }, [data, initialized, initFromSnapshot]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTechoOpen, setEditTechoOpen] = useState(false);
  const [editTopeFor, setEditTopeFor] = useState<CategoryBudget | null>(null);
  const [addVigOpen, setAddVigOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const categories = useMemo<CategoryBudget[]>(() => {
    if (!data) return [];
    return [...data.categories, ...customCategories];
  }, [data, customCategories]);

  const vigCats = useMemo(
    () => categories.filter((c) => (topes[c.id] ?? 0) > 0),
    [categories, topes],
  );

  const vigSorted = useMemo(
    () =>
      [...vigCats].sort(
        (a, b) => b.spent / (topes[b.id] || 1) - a.spent / (topes[a.id] || 1),
      ),
    [vigCats, topes],
  );

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

  const state: 'A' | 'B' | 'C' =
    techo == null ? 'A' : Object.keys(topes).length === 0 ? 'B' : 'C';

  const monthForCard = {
    ...data.month,
    target: techo ?? data.month.target,
  };

  const handleCreate = (newTecho: number, newTopes: Record<string, number>) => {
    setTechoValue(newTecho);
    setTopesValue(newTopes);
    setCreateOpen(false);
  };

  const handleSaveTecho = (amount: number) => {
    setTechoValue(amount);
    setEditTechoOpen(false);
  };

  const handleSaveTope = (amount: number) => {
    if (!editTopeFor) return;
    setTopeValue(editTopeFor.id, amount);
    setEditTopeFor(null);
  };

  const handleDeleteTopeRequest = () => {
    if (!editTopeFor) return;
    const id = editTopeFor.id;
    setEditTopeFor(null);
    setTimeout(() => setConfirm({ kind: 'tope', catId: id }), SHEET_CLOSE_MS);
  };

  const handleDeleteTechoRequest = () => {
    setEditTechoOpen(false);
    setTimeout(() => setConfirm({ kind: 'techo' }), SHEET_CLOSE_MS);
  };

  const confirmDelete = () => {
    if (!confirm) return;
    if (confirm.kind === 'techo') {
      deleteTechoValue();
      setExpandedId(null);
    } else {
      deleteTopeValue(confirm.catId);
      if (expandedId === confirm.catId) setExpandedId(null);
    }
    setConfirm(null);
  };

  const handlePickVigilance = (cat: CategoryBudget) => {
    setAddVigOpen(false);
    setTimeout(() => setEditTopeFor(cat), SHEET_CLOSE_MS);
  };

  const handleViewAll = (cat: CategoryBudget) => {
    router.push({ pathname: '/(tabs)/movements', params: { categoryId: cat.id } });
  };

  const headerSubtitle =
    state === 'A' ? t('budgets.noActiveBudget') : t('budgets.subtitle');

  const confirmTitle =
    confirm?.kind === 'techo'
      ? t('budgets.confirmSheet.techoTitle', { month: 'mayo' })
      : confirm?.kind === 'tope'
        ? t('budgets.confirmSheet.topeTitle', {
            name: categories.find((c) => c.id === confirm.catId)?.name ?? '',
          })
        : '';
  const confirmBody =
    confirm?.kind === 'techo'
      ? t('budgets.confirmSheet.techoBody')
      : confirm?.kind === 'tope'
        ? t('budgets.confirmSheet.topeBody')
        : '';
  const confirmCta =
    confirm?.kind === 'techo'
      ? t('budgets.confirmSheet.techoCta')
      : t('budgets.confirmSheet.topeCta');

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 130,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 16 }}>
          <BudgetsHeader
            onAvatarPress={() => router.push('/profile')}
            subtitle={headerSubtitle}
          />

          {state === 'A' && <EmptyState onCreate={() => setCreateOpen(true)} />}

          {state !== 'A' && (
            <>
              <MonthHero month={monthForCard} onPress={() => setEditTechoOpen(true)} />
              <ProjectionCallout projection={data.projection} />

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
                    {vigSorted.map((c) => (
                      <CategoryItem
                        key={c.id}
                        category={c}
                        tope={topes[c.id] ?? c.target}
                        expanded={expandedId === c.id}
                        onToggle={() =>
                          setExpandedId((id) => (id === c.id ? null : c.id))
                        }
                        onEdit={() => setEditTopeFor(c)}
                        onViewAll={() => handleViewAll(c)}
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
        categories={categories}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        onCreateCategory={addCustomCategory}
      />

      <EditTechoSheet
        visible={editTechoOpen}
        current={techo}
        onClose={() => setEditTechoOpen(false)}
        onSave={(amount) => handleSaveTecho(amount)}
        onDelete={handleDeleteTechoRequest}
      />

      <EditTopeSheet
        visible={editTopeFor != null}
        category={editTopeFor}
        current={editTopeFor ? (topes[editTopeFor.id] ?? 0) : 0}
        onClose={() => setEditTopeFor(null)}
        onSave={handleSaveTope}
        onDelete={
          editTopeFor && topes[editTopeFor.id] != null
            ? handleDeleteTopeRequest
            : undefined
        }
      />

      <AddVigilanceSheet
        visible={addVigOpen}
        categories={categories}
        topes={topes}
        onClose={() => setAddVigOpen(false)}
        onPick={handlePickVigilance}
      />

      <ConfirmSheet
        visible={confirm != null}
        title={confirmTitle}
        body={confirmBody}
        confirmLabel={confirmCta}
        onConfirm={confirmDelete}
        onClose={() => setConfirm(null)}
      />
    </SafeAreaView>
  );
}

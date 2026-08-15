import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GateSheet } from '@/modules/plan/presentation/components/GateSheet';
import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import type { CurrencyCode } from '@/shared/domain';
import {
  Aurora,
  DashedButton,
  Icon,
  RetryState,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, toIsoDate } from '@/shared/presentation/utils/dates';
import { amountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

import { GoalLimitReachedError, GoalNotEmptyError, type Goal } from '../../domain';
import { ContributionSheet } from '../components/ContributionSheet';
import { GoalCard } from '../components/GoalCard';
import { GoalFormSheet, type GoalFormInput } from '../components/GoalFormSheet';
import { useGoals } from '../hooks/useGoals';
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from '../hooks/useGoalMutations';

/** What a free account gets. The server's 403 is the one that rules. */
const FREE_GOALS = 1;

/**
 * Metas, running on the API.
 *
 * Pockets hold real money: a contribution is a genuine transfer, so every figure
 * here is shared with Cuentas and Movimientos rather than kept on its own.
 *
 * The redesign leads with the total across all of them, because that is the
 * number that answers "am I saving?" — a question no individual goal can. Each
 * goal below is then a card that asks only its own question, and carries the one
 * action that changes it.
 */
export function GoalsScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  // Pinned once per mount: the pace projection is derived for this day.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const { data, isLoading, isError, refetch } = useGoals(today);

  const createGoal = useCreateGoal(today);
  const updateGoal = useUpdateGoal(today);
  const deleteGoal = useDeleteGoal();

  const [formSheet, setFormSheet] = useState<{ open: boolean; goal: Goal | null }>({
    open: false,
    goal: null,
  });
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const tier = useTier();

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <RetryState
          titleKey="goals.error.title"
          retryKey="goals.error.retry"
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
  const active = data.goals.filter((goal) => !goal.archived);
  const archived = data.goals.filter((goal) => goal.archived);
  const savedTotal = active.reduce((sum, goal) => sum + goal.saved, 0);
  const targetTotal = active.reduce((sum, goal) => sum + goal.target, 0);

  const isPlus = tier === 'plus';
  const atLimit = !isPlus && active.length >= FREE_GOALS;

  const closeForm = () => setFormSheet({ open: false, goal: null });
  const showToast = (message: string) => setToast({ visible: true, message });

  const report = (error: Error) => {
    if (error instanceof GoalLimitReachedError) {
      setGateOpen(true);
      return;
    }
    showToast(
      error instanceof GoalNotEmptyError ? t('goals.errors.notEmpty') : t('common.error'),
    );
  };

  const handleAddPress = () => {
    // Courtesy pre-gate; the server's 403 is the one that rules.
    if (atLimit) {
      setGateOpen(true);
      return;
    }
    setFormSheet({ open: true, goal: null });
  };

  const handleSave = (input: GoalFormInput) => {
    closeForm();
    if (formSheet.goal) {
      updateGoal.mutate({ id: formSheet.goal.id, patch: input }, { onError: report });
      return;
    }
    createGoal.mutate(input, { onError: report });
  };

  const handleArchive = () => {
    const goal = formSheet.goal;
    closeForm();
    if (!goal) return;
    updateGoal.mutate(
      { id: goal.id, patch: { archived: !goal.archived } },
      {
        onSuccess: (updated) =>
          showToast(
            t(updated.archived ? 'goals.toast.archived' : 'goals.toast.reopened'),
          ),
        onError: report,
      },
    );
  };

  const handleDelete = () => {
    const goal = formSheet.goal;
    closeForm();
    if (!goal) return;
    deleteGoal.mutate(goal.id, {
      onSuccess: () => showToast(t('goals.toast.deleted')),
      onError: report,
    });
  };

  /** The card's top-right note: when it lands, or that it already has. */
  const deadlineOf = (goal: Goal): string => {
    if (goal.achieved) return t('goals.card.done');
    if (goal.projectedOn === null) return t('goals.card.noPace');
    const month = monthName(`${goal.projectedOn}-01`, i18n.language);
    return `${month} ${goal.projectedOn.slice(0, 4)}`;
  };

  return (
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 26,
        }}
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
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{t('goals.title')}</Text>
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 8 }}
          >
            {t('goals.hero.label')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 19, fontWeight: '300' }}
            >
              $
            </Text>
            <Text
              tabular
              style={{
                fontSize: 41,
                fontWeight: '500',
                letterSpacing: -2,
              }}
            >
              {amountDigits(savedTotal, currency)}
            </Text>
          </View>
          {active.length > 0 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 12.5, marginTop: 9 }}
            >
              {t('goals.hero.of', {
                amount: formatMoney(targetTotal, currency),
                count: active.length,
              })}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 26, gap: 12 }}>
          {active.length === 0 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 13, lineHeight: 19, paddingVertical: 10 }}
            >
              {t('goals.empty')}
            </Text>
          ) : (
            active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currency={currency}
                deadline={deadlineOf(goal)}
                onContribute={() => setContributionGoal(goal)}
                onEdit={() => setFormSheet({ open: true, goal })}
              />
            ))
          )}
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
          <DashedButton label={t('goals.add')} onPress={handleAddPress} />
          {/* Said before the button, not fired as an error after it. */}
          <Text
            color={atLimit ? theme.colors.accentCoralSoft : theme.colors.textTertiary}
            style={{ fontSize: 11, textAlign: 'center', marginTop: 10 }}
          >
            {isPlus
              ? t('goals.capacity.plus', { count: active.length })
              : t('goals.capacity.free', { count: active.length, limit: FREE_GOALS })}
          </Text>
        </View>

        {archived.length > 0 ? (
          <View style={{ paddingHorizontal: 26, paddingTop: 28, gap: 12 }}>
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.2 }}
            >
              {t('goals.archivedSection')}
            </Text>
            {archived.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currency={currency}
                deadline={deadlineOf(goal)}
                onContribute={() => setContributionGoal(goal)}
                onEdit={() => setFormSheet({ open: true, goal })}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <GoalFormSheet
        visible={formSheet.open}
        goal={formSheet.goal}
        today={data.today}
        saving={createGoal.isPending || updateGoal.isPending}
        onClose={closeForm}
        onSave={handleSave}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
      <ContributionSheet
        visible={contributionGoal !== null}
        goal={contributionGoal}
        today={today}
        onClose={() => setContributionGoal(null)}
        onSaved={(message) => {
          setContributionGoal(null);
          showToast(message);
        }}
      />
      <GateSheet
        visible={gateOpen}
        title={t('goals.gate.title')}
        body={t('goals.gate.body')}
        onClose={() => setGateOpen(false)}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onDismiss={() => setToast({ visible: false, message: '' })}
      />
    </Aurora>
  );
}

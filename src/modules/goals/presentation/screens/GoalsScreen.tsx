import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GateSheet } from '@/modules/plan/presentation/components/GateSheet';
import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import { GoalLimitReachedError, GoalNotEmptyError } from '../../domain';
import {
  Card,
  Icon,
  IconBox,
  ProgressBar,
  RetryState,
  SectionLabel,
  SubScreenHeader,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Goal } from '../../domain';
import { ContributionSheet } from '../components/ContributionSheet';
import { GoalFormSheet, type GoalFormInput } from '../components/GoalFormSheet';
import { useGoals } from '../hooks/useGoals';
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from '../hooks/useGoalMutations';

/**
 * Metas, running on the API. Pockets hold real money: a contribution is a genuine
 * transfer, so this screen shares every figure with Cuentas and Movimientos instead
 * of keeping its own (the prototype's zustand died with its persisted `saved`).
 */
export function GoalsScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

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
  const tier = usePlanStore((s) => s.tier);

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <SubScreenHeader title={t('goals.title')} onBack={() => router.back()} />
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
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  const active = data.goals.filter((goal) => !goal.archived);
  const archived = data.goals.filter((goal) => goal.archived);

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
    if (tier === 'free' && active.length >= 1) {
      setGateOpen(true);
      return;
    }
    setFormSheet({ open: true, goal: null });
  };

  const handleSave = (input: GoalFormInput) => {
    closeForm();
    if (formSheet.goal) {
      updateGoal.mutate({ id: formSheet.goal.id, patch: input }, { onError: report });
    } else {
      createGoal.mutate(input, { onError: report });
    }
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

  const projectionLine = (goal: Goal): string => {
    if (goal.achieved) return t('goals.achieved');
    if (goal.projectedOn === null) return t('goals.projectionEmpty');
    const month = monthName(`${goal.projectedOn}-01`, i18n.language);
    const year = goal.projectedOn.slice(0, 4);
    const when = `${month} ${year}`;
    if (goal.neededPerMonth !== null) {
      return `${t('goals.projection', { month: when })} · ${t('goals.needed', {
        amount: formatMoney(goal.neededPerMonth),
      })}`;
    }
    return t('goals.projection', { month: when });
  };

  const goalCard = (goal: Goal) => (
    <Card key={goal.id} padding={16}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <IconBox name={goal.icon} color={goal.color} size={36} iconSize={17} />
        <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1 }}>
          {goal.name}
        </Text>
        <Text
          variant="caption"
          color={goal.achieved ? theme.colors.accentMint : theme.colors.textSecondary}
          tabular
          style={{ fontFamily: 'Geist_500Medium' }}
        >
          {Math.round(goal.pct * 100)}%
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
          marginBottom: 10,
        }}
      >
        <Text variant="h2" tabular>
          {formatMoney(goal.saved)}
        </Text>
        <Text variant="caption" muted>
          {t('goals.of')} {formatMoney(goal.target)}
        </Text>
      </View>
      {/* Progress toward the target: more is better, so no warning ramp. */}
      <ProgressBar pct={goal.pct} height={6} color={theme.colors.accentMint} />
      <Text
        variant="caption"
        color={goal.achieved ? theme.colors.accentMint : theme.colors.textTertiary}
        style={{ marginTop: 10, marginBottom: goal.archived ? 0 : 12 }}
      >
        {projectionLine(goal)}
      </Text>
      {!goal.archived ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ActionButton
            label={t('goals.contribute')}
            accent
            onPress={() => setContributionGoal(goal)}
          />
          <ActionButton
            label={t('goals.edit')}
            onPress={() => setFormSheet({ open: true, goal })}
          />
        </View>
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader title={t('goals.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 32,
          paddingHorizontal: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {active.length === 0 ? (
          <Card padding={22}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <IconBox name="target" color="mint" size={40} iconSize={19} />
              <Text variant="bodyLarge">{t('goals.empty.title')}</Text>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={{ textAlign: 'center' }}
              >
                {t('goals.empty.body')}
              </Text>
            </View>
          </Card>
        ) : (
          active.map(goalCard)
        )}

        <Pressable
          accessibilityRole="button"
          onPress={handleAddPress}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderColor: theme.colors.borderDefault,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 13,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Icon name="plus" size={14} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            {t('goals.add')}
          </Text>
        </Pressable>

        {archived.length > 0 ? (
          <View style={{ gap: 12, marginTop: 8 }}>
            <SectionLabel>{t('goals.archivedSection')}</SectionLabel>
            {archived.map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => setFormSheet({ open: true, goal })}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 0.72 })}
              >
                {goalCard(goal)}
              </Pressable>
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
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  accent = false,
  onPress,
}: {
  label: string;
  accent?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 11,
        backgroundColor: accent ? theme.colors.accentMintBg : theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: accent ? 'transparent' : theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        variant="label"
        color={accent ? theme.colors.accentMint : theme.colors.textSecondary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

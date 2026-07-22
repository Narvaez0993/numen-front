import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GateSheet } from '@/modules/plan/presentation/components/GateSheet';
import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import {
  Card,
  Icon,
  IconBox,
  ProgressBar,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { type Goal, goalPct } from '../../domain/types/Goal';
import { ContributionSheet } from '../components/ContributionSheet';
import { GoalFormSheet, type GoalFormInput } from '../components/GoalFormSheet';
import { useGoalsStore } from '../stores/useGoalsStore';

function projectionText(
  goal: Goal,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (goal.saved <= 0) return t('goals.projectionEmpty');
  if (!goal.projectionMonth) return t('goals.projectionSoon');
  return t('goals.projection', { month: goal.projectionMonth });
}

export function GoalsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const removeGoal = useGoalsStore((s) => s.removeGoal);
  const addContribution = useGoalsStore((s) => s.addContribution);

  const [formSheet, setFormSheet] = useState<{ open: boolean; goal: Goal | null }>({
    open: false,
    goal: null,
  });
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const tier = usePlanStore((s) => s.tier);

  const closeForm = () => setFormSheet({ open: false, goal: null });

  const handleAddPress = () => {
    if (tier === 'free' && goals.length >= 1) {
      setGateOpen(true);
      return;
    }
    setFormSheet({ open: true, goal: null });
  };

  const handleSave = (input: GoalFormInput) => {
    if (formSheet.goal) {
      updateGoal(formSheet.goal.id, input);
    } else {
      addGoal({
        id: `goal-${Date.now()}`,
        name: input.name,
        iconName: 'target',
        color: 'mint',
        target: input.target,
        saved: 0,
        projectionMonth: '',
      });
    }
    closeForm();
  };

  const handleDelete = () => {
    if (formSheet.goal) removeGoal(formSheet.goal.id);
    closeForm();
  };

  const handleContribute = (amount: number) => {
    if (contributionGoal) addContribution(contributionGoal.id, amount);
    setContributionGoal(null);
  };

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
        {goals.length === 0 ? (
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
          goals.map((goal) => {
            const pct = goalPct(goal);
            return (
              <Card key={goal.id} padding={16}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <IconBox
                    name={goal.iconName}
                    color={goal.color}
                    size={36}
                    iconSize={17}
                  />
                  <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1 }}>
                    {goal.name}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.accentMint}
                    tabular
                    style={{ fontFamily: 'Geist_500Medium' }}
                  >
                    {Math.round(pct * 100)}%
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
                    {formatCOP(goal.saved)}
                  </Text>
                  <Text variant="caption" muted>
                    {t('goals.of')} {formatCOP(goal.target)}
                  </Text>
                </View>
                <ProgressBar pct={pct} height={6} />
                <Text
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={{ marginTop: 10, marginBottom: 12 }}
                >
                  {projectionText(goal, t)}
                </Text>
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
              </Card>
            );
          })
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
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="plus" size={14} color={theme.colors.textSecondary} />
          <Text
            variant="label"
            color={theme.colors.textSecondary}
            style={{ fontSize: 12 }}
          >
            {t('goals.add')}
          </Text>
        </Pressable>
      </ScrollView>

      <GoalFormSheet
        visible={formSheet.open}
        goal={formSheet.goal}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <ContributionSheet
        visible={contributionGoal !== null}
        goal={contributionGoal}
        onClose={() => setContributionGoal(null)}
        onSave={handleContribute}
      />
      <GateSheet
        visible={gateOpen}
        title={t('goals.gate.title')}
        body={t('goals.gate.body')}
        onClose={() => setGateOpen(false)}
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
        borderRadius: 12,
        backgroundColor: accent ? theme.colors.accentMintBg : theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: accent ? 'transparent' : theme.colors.borderSubtle,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        variant="label"
        color={accent ? theme.colors.accentMint : theme.colors.textPrimary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

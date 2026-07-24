import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { GOALS, type GoalId } from '../../domain';

import { GoalCard } from '../components/GoalCard';
import { OnbCTA } from '../components/OnbCTA';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { SegmentProgress } from '../components/SegmentProgress';
import { StepIndicator } from '../components/StepIndicator';

type Props = {
  name: string;
  initialGoal: GoalId | null;
  onBack: () => void;
  onContinue: (goal: GoalId | null) => void;
};

export function PersoGoalScreen({ name, initialGoal, onBack, onContinue }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<GoalId | null>(initialGoal);
  const firstName = name.split(/\s+/)[0] || t('onboarding.perso.goal.friend');

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={24}>
      <OnbHeader
        onBack={onBack}
        center={<StepIndicator>{t('onboarding.perso.step2')}</StepIndicator>}
      />
      <View style={{ marginTop: 14 }}>
        <SegmentProgress total={2} current={1} />
      </View>

      <View style={{ height: 28 }} />

      <Text
        style={{
          fontSize: 22,
          fontFamily: 'Geist_500Medium',
          color: theme.colors.textPrimary,
          letterSpacing: -0.44,
          marginBottom: 8,
          lineHeight: 28,
        }}
      >
        {t('onboarding.perso.goal.title', { name: firstName })}
      </Text>
      <Text variant="body" muted style={{ fontSize: 13, lineHeight: 19 }}>
        {t('onboarding.perso.goal.subtitle')}
      </Text>

      <View style={{ height: 24 }} />

      <View style={{ gap: 10 }}>
        {GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            icon={goal.icon}
            color={goal.color}
            title={t(`onboarding.perso.goal.${goal.id}.title`)}
            subtitle={t(`onboarding.perso.goal.${goal.id}.sub`)}
            active={selected === goal.id}
            onPress={() => setSelected(goal.id)}
          />
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <OnbCTA disabled={!selected} onPress={() => onContinue(selected)}>
        {t('onboarding.perso.continue')}
      </OnbCTA>
      <OnbTextLink onPress={() => onContinue(null)} style={{ marginTop: 4 }}>
        {t('onboarding.perso.skip')}
      </OnbTextLink>
    </OnbPage>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { InkButton } from '@/shared/presentation/components';

import { GOALS, type GoalId } from '../../domain';
import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { OnbOption } from '../components/OnbOption';
import { OnbTopBar } from '../components/OnbTopBar';

type Props = {
  name: string;
  initialGoal: GoalId | null;
  onBack: () => void;
  onContinue: (goal: GoalId) => void;
};

/**
 * «Valentina, ¿qué te trae por acá?» — the objective, in the user's words
 * rather than the app's: «No sé en qué se me va», not «Controlar mis gastos».
 *
 * It decides what Home leads with (HU-25), which is why there is no skip: the
 * design has none, and «no hay respuesta mala» is the reassurance instead.
 */
export function GoalStep({ name, initialGoal, onBack, onContinue }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<GoalId | null>(initialGoal);
  const firstName = name.split(/\s+/)[0] ?? name;

  return (
    <OnbFrame scroll>
      <OnbTopBar onBack={onBack} label={t('onboarding.setup.step', { step: 2 })} />
      <OnbHeadline
        i18nKey="onboarding.setup.goal.title"
        values={{ name: firstName }}
        body={t('onboarding.setup.goal.body')}
        bodyGap={12}
      />

      <View style={{ paddingHorizontal: 22, paddingTop: 24, gap: 9 }}>
        {GOALS.map((goal) => (
          <OnbOption
            key={goal.id}
            title={t(`onboarding.setup.goal.options.${goal.id}.title`)}
            subtitle={t(`onboarding.setup.goal.options.${goal.id}.sub`)}
            selected={selected === goal.id}
            onPress={() => setSelected(goal.id)}
          />
        ))}
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        <InkButton
          label={t('onboarding.setup.goal.submit')}
          onPress={() => {
            if (selected) onContinue(selected);
          }}
          disabled={selected === null}
          height={56}
        />
      </View>
    </OnbFrame>
  );
}

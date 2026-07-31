import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AgentOutput, AgentPlay } from '../../../domain/types/AgentFeed';
import { useApplyPlay } from '../../hooks/useCorteMutations';
import { PlayAccountSheet } from './PlayAccountSheet';

type Props = {
  corte: AgentOutput;
  play: AgentPlay;
  today: string;
};

/**
 * The button under a play, driven by its persisted state. Caps apply on tap;
 * a contribution first asks which account the money leaves from. `plan_limit`
 * failures turn into the honest next step: the plan screen.
 */
export function PlayAction({ corte, play, today }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const apply = useApplyPlay();
  const [pickingAccount, setPickingAccount] = useState(false);

  if (play.action === 'treat' || play.status === 'applied') {
    return null;
  }

  const run = (accountId: string | null) => {
    setPickingAccount(false);
    apply.mutate({ outputId: corte.id, playId: play.id, accountId, today });
  };

  if (play.status === 'failed') {
    if (play.failureCode === 'plan_limit') {
      return (
        <View style={{ gap: 6 }}>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ fontSize: 12 }}
          >
            {t('assistant.corte.play.planLimit')}
          </Text>
          <Button
            label={t('assistant.corte.play.seePlus')}
            variant="secondary"
            onPress={() => router.push('/plan')}
          />
        </View>
      );
    }
    return (
      <Text variant="caption" color={theme.colors.accentCoral} style={{ fontSize: 12 }}>
        {t('assistant.corte.play.failedBody')}
      </Text>
    );
  }

  return (
    <>
      <Button
        label={t('assistant.corte.play.apply')}
        loading={apply.isPending || play.status === 'applying'}
        disabled={apply.isPending || play.status === 'applying'}
        onPress={() =>
          play.action === 'contribute_goal' ? setPickingAccount(true) : run(null)
        }
      />
      {play.action === 'contribute_goal' ? (
        <PlayAccountSheet
          visible={pickingAccount}
          amount={play.amount}
          goalName={play.goalName}
          onConfirm={run}
          onClose={() => setPickingAccount(false)}
        />
      ) : null}
    </>
  );
}

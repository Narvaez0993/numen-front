import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AgentOutput, AgentPlay } from '../../../domain/types/AgentFeed';
import { useApplyPlay } from '../../hooks/useCorteMutations';
import { PlayAccountSheet } from './PlayAccountSheet';

/** The one solid button of a story: light on dark, dark on light. It is the only
 *  thing on the screen that changes anything, so it is the only thing filled. */
function SolidButton({
  label,
  busy = false,
  onPress,
}: {
  label: string;
  busy?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor: theme.colors.textPrimary,
        opacity: busy ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Text color={theme.colors.bgBase} style={{ fontSize: 12.5, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The quieter one, for a step that leads somewhere rather than doing something. */
function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
        {label}
      </Text>
    </Pressable>
  );
}

type Props = {
  /** The Corte or the weekly review the play belongs to. */
  output: AgentOutput;
  play: AgentPlay;
  today: string;
};

/**
 * The button under a play, driven by its persisted state. Caps apply on tap;
 * a contribution first asks which account the money leaves from. `plan_limit`
 * failures turn into the honest next step: the plan screen.
 */
export function PlayAction({ output, play, today }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const apply = useApplyPlay();
  const [pickingAccount, setPickingAccount] = useState(false);

  if (play.action === 'treat' || play.status === 'applied') {
    return null;
  }

  const run = (accountId: string | null) => {
    setPickingAccount(false);
    apply.mutate({ outputId: output.id, playId: play.id, accountId, today });
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
          <GhostButton
            label={t('assistant.corte.play.seePlus')}
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
      <SolidButton
        label={t('assistant.corte.play.apply')}
        busy={apply.isPending || play.status === 'applying'}
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

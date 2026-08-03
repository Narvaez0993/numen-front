import type { TFunction } from 'i18next';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentPlay } from '../../../domain/types/AgentFeed';

type Props = {
  play: AgentPlay;
  /** The apply button arrives with the apply slice; without it the row reads. */
  action?: React.ReactNode;
};

function playAmountLine(play: AgentPlay, t: TFunction): string {
  switch (play.action) {
    case 'set_category_cap':
      return t('assistant.corte.play.setCap', {
        name: play.categoryName,
        amount: formatMoney(play.target),
      });
    case 'raise_category_cap':
      return t('assistant.corte.play.raiseCap', {
        name: play.categoryName,
        from: formatMoney(play.currentTarget),
        to: formatMoney(play.target),
      });
    case 'set_month_cap':
      return t('assistant.corte.play.monthCap', { amount: formatMoney(play.target) });
    case 'contribute_goal':
      return t('assistant.corte.play.contribute', {
        name: play.goalName,
        amount: formatMoney(play.amount),
      });
    case 'treat':
      return t('assistant.corte.play.treat', { amount: formatMoney(play.amount) });
  }
}

/** One proposed move: the agent's line, the concrete numbers, its state. */
export function PlayRow({ play, action }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pill variant="mint" uppercase>
          {t('assistant.corte.play.pill')}
        </Pill>
        {play.status === 'applied' ? (
          <Pill variant="mint">{t('assistant.corte.play.applied')}</Pill>
        ) : null}
        {play.status === 'failed' ? (
          <Pill variant="coral">{t('assistant.corte.play.failed')}</Pill>
        ) : null}
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ lineHeight: 18 }}
      >
        {play.text}
      </Text>
      <Text variant="label" style={{ fontSize: 13.5 }}>
        {playAmountLine(play, t)}
      </Text>
      {action}
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Icon, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { goalPct } from '../../domain/types/Goal';
import { useGoalsStore } from '../stores/useGoalsStore';

type Props = { onPress: () => void };

export function GoalsInicioCard({ onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const goals = useGoalsStore((s) => s.goals);
  const goal = goals[0];
  if (!goal) return null;

  const pct = goalPct(goal);

  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="target" color="mint" size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 6,
              marginBottom: 6,
            }}
          >
            <Text
              variant="bodyLarge"
              numberOfLines={1}
              style={{ fontSize: 13.5, letterSpacing: -0.135, flexShrink: 1 }}
            >
              {goal.name}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.accentMint}
              tabular
              style={{ fontSize: 11.5, fontFamily: 'Geist_500Medium' }}
            >
              {Math.round(pct * 100)}%
            </Text>
          </View>
          <ProgressBar pct={pct} height={4} />
          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, marginTop: 6 }}
          >
            {t('goals.projection', { month: goal.projectionMonth })}
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </Card>
  );
}

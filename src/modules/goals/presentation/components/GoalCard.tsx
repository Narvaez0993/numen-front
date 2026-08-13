import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Goal } from '../../domain';

type Props = {
  goal: Goal;
  currency: CurrencyCode;
  /** When the goal lands, or what it needs each month — the screen composes it. */
  deadline: string;
  onContribute: () => void;
  onEdit: () => void;
};

/**
 * One goal: how much of it exists, and the one action that moves it.
 *
 * The contribution button carries an AMOUNT, not the word "aportar". A goal with
 * a date knows what each remaining month needs, and putting that number on the
 * button turns a decision into a confirmation — the difference between "how much
 * should I put in?" and "yes, that".
 *
 * Beside it, what is still missing. The two together are the whole question: this
 * much now, that much left.
 */
export function GoalCard({ goal, currency, deadline, onContribute, onEdit }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const missing = Math.max(goal.target - goal.saved, 0);
  const filled = Math.min(Math.max(goal.pct, 0), 1);
  const suggested = goal.neededPerMonth;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onEdit}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 22,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
          {goal.name}
        </Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12 }}>
          {deadline}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 5,
          marginBottom: 11,
        }}
      >
        <Text tabular style={{ fontSize: 24, fontWeight: '500', letterSpacing: -0.9 }}>
          {formatMoney(goal.saved, currency)}
        </Text>
        <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
          {t('goals.of')} {formatMoney(goal.target, currency)}
        </Text>
      </View>

      <View
        style={{
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 13,
          backgroundColor: withAlpha(theme.colors.textPrimary, 0.1),
        }}
      >
        <View style={{ width: `${filled * 100}%`, height: '100%' }}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="goalFill" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.palette.orb3} />
                <Stop offset="1" stopColor={theme.palette.acc} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#goalFill)" />
          </Svg>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onContribute}
          style={({ pressed }) => ({
            minHeight: 40,
            justifyContent: 'center',
            paddingHorizontal: 15,
            borderRadius: 14,
            backgroundColor: withAlpha(theme.palette.acc, 0.16),
            borderWidth: 1,
            borderColor: withAlpha(theme.palette.acc, 0.22),
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text color={theme.palette.acc3} style={{ fontSize: 12.5, fontWeight: '500' }}>
            {suggested !== null && suggested > 0
              ? t('goals.card.contributeAmount', {
                  amount: formatMoney(suggested, currency),
                })
              : t('goals.card.contribute')}
          </Text>
        </Pressable>

        <Text
          tabular
          numberOfLines={1}
          color={theme.colors.textTertiary}
          style={{ flex: 1, fontSize: 11.5 }}
        >
          {goal.achieved
            ? t('goals.achieved')
            : t('goals.card.missing', { amount: formatMoney(missing, currency) })}
        </Text>
      </View>
    </Pressable>
  );
}

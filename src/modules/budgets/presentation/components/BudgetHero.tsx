import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { amountDigits } from '@/shared/presentation/utils/formatMoney';

import type { Cap } from '../../domain';

const BAR_HEIGHT = 6;

type Props = {
  cap: Cap;
  currency: CurrencyCode;
  daysElapsed: number;
  daysLeft: number;
};

/**
 * What is left of the month, and whether it is being spent at the right speed.
 *
 * The bar answers a question a percentage cannot: 68% used is fine on the 25th
 * and alarming on the 8th. So the month's own progress is marked on it as a
 * tick, and the whole judgement becomes visual — fill behind the tick means
 * ahead, fill past it means behind. Two numbers underneath say the same thing in
 * words for anyone who would rather read it.
 *
 * The fill is a gradient rather than a flat accent because it has to survive
 * being read at 6px: a single tone at that height reads as a line, and a line
 * has no direction.
 */
export function BudgetHero({ cap, currency, daysElapsed, daysLeft }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const days = daysElapsed + daysLeft;
  // Where a month spent evenly would be today. Guarded because the first render
  // of a fresh month can legitimately have zero days behind it.
  const pace = days > 0 ? Math.min(daysElapsed / days, 1) : 0;
  const used = Math.min(Math.max(cap.used, 0), 1);
  const over = cap.remaining < 0;

  return (
    <View>
      <Text
        variant="micro"
        uppercase
        color={theme.colors.textTertiary}
        style={{ letterSpacing: 2.2, marginBottom: 9 }}
      >
        {t('budgets.hero.left')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
        <Text
          color={theme.colors.textTertiary}
          style={{ fontSize: 19, fontWeight: '300' }}
        >
          {over ? '−$' : '$'}
        </Text>
        <Text
          tabular
          color={over ? theme.colors.accentCoral : theme.colors.textPrimary}
          style={{
            fontSize: 45,
            fontWeight: '500',
            letterSpacing: -2.2,
          }}
        >
          {amountDigits(Math.abs(cap.remaining), currency)}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            height: BAR_HEIGHT,
            borderRadius: 4,
            backgroundColor: withAlpha(theme.colors.textPrimary, 0.1),
          }}
        >
          <View
            style={{
              width: `${used * 100}%`,
              height: '100%',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="budgetFill" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={theme.palette.orb3} />
                  <Stop offset="1" stopColor={theme.palette.acc} />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#budgetFill)" />
            </Svg>
          </View>

          {/* The month itself, as a mark. Everything about whether the number
              above is good news is the relationship between this and the fill. */}
          <View
            style={{
              position: 'absolute',
              left: `${pace * 100}%`,
              top: -5,
              width: 1.5,
              height: 16,
              borderRadius: 1,
              backgroundColor: withAlpha(theme.colors.textPrimary, 0.55),
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 9,
          }}
        >
          <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 10.5 }}>
            {t('budgets.hero.used', { pct: Math.round(cap.used * 100) })}
          </Text>
          <Text color={theme.colors.textTertiary} style={{ fontSize: 10.5 }}>
            {t('budgets.hero.pace', { pct: Math.round(pace * 100) })}
          </Text>
        </View>
      </View>
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { BudgetCap } from '@/modules/home/domain/types/HomeOverview';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatAmountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  budget: BudgetCap;
  daysLeft: number;
  /** Share of the month already gone, 0..1 — where the pace marker sits. */
  elapsed: number;
  onPress: () => void;
};

/**
 * What is left of the cap, and the pace that would spend it exactly.
 *
 * The bar carries two marks. The fill is what has been spent; the hairline is
 * where the month is — so a fill short of the line means running under, and past
 * it means running over. It answers "am I ahead or behind" without a sentence.
 *
 * Only rendered when a cap exists. The per-day figure is legitimate here and
 * nowhere else, because it divides a limit the user chose rather than granting
 * one the app invented.
 */
export function BudgetPulse({ budget, daysLeft, elapsed, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const over = budget.remaining < 0;
  const fill = Math.min(Math.max(budget.used, 0), 1);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 9,
        }}
      >
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 7,
              marginBottom: 6,
            }}
          >
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.2 }}
            >
              {over ? t('home.budget.over') : t('home.budget.left')}
            </Text>
            <Text
              variant="micro"
              uppercase
              color={theme.palette.acc2}
              style={{ letterSpacing: 1.2 }}
            >
              {t('home.budget.label')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 15, fontWeight: '300' }}
            >
              $
            </Text>
            <Text
              tabular
              style={{
                fontSize: 26,
                fontWeight: '500',
                letterSpacing: -1.1,
                lineHeight: 27,
                color: over ? theme.colors.accentCoral : theme.colors.textPrimary,
              }}
            >
              {formatAmountDigits(String(Math.abs(budget.remaining)))}
            </Text>
          </View>
        </View>

        {budget.perDay !== null ? (
          <View style={{ alignItems: 'flex-end', paddingBottom: 2 }}>
            <Text tabular style={{ fontSize: 14, fontWeight: '500' }}>
              {formatMoney(budget.perDay)}
            </Text>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 11, marginTop: 3 }}
            >
              {t('home.budget.perDay', { count: daysLeft })}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={{
          height: 4,
          borderRadius: theme.radius.bar,
          backgroundColor: theme.colors.bgElevated,
        }}
      >
        <View
          style={{
            width: `${fill * 100}%`,
            height: '100%',
            borderRadius: theme.radius.bar,
            backgroundColor: over ? theme.colors.accentCoral : theme.palette.acc,
          }}
        />
        {/* Where the month is. Fill behind it means under pace, past it means over. */}
        <View
          style={{
            position: 'absolute',
            left: `${Math.min(elapsed, 1) * 100}%`,
            top: -4,
            width: 1.5,
            height: 12,
            borderRadius: 1,
            backgroundColor: theme.colors.textSecondary,
          }}
        />
      </View>
    </Pressable>
  );
}

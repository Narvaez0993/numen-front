import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { DaySpend } from '@/modules/home/domain/types/HomeOverview';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

const STRIP_HEIGHT = 42;
/** Enough to be visible on a day that cost nothing without reading as spending. */
const MIN_BAR = 0.06;

type Props = {
  byDay: DaySpend[];
  /** Today's total, called out under the strip. */
  spentToday: number;
  /** What the month is on course to cost. `null` in its first days, when a
   *  projection would be noise. */
  projected: number | null;
  language: string;
};

/**
 * The month as a row of bars — one per day, tallest is the heaviest.
 *
 * Position is the date, which is why the series arrives dense: a quiet day is a
 * short bar, not a missing one, or every bar after it slides onto the wrong day.
 * It stops at today rather than running to the end of the month, because empty
 * slots for days that have not happened would read as days nothing was spent.
 *
 * Deliberately unlabelled. It is not a chart to read values off — it is the shape
 * of the month at a glance, and the three words underneath say where it starts,
 * where today sits and where it is heading.
 */
export function RhythmStrip({ byDay, spentToday, projected, language }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (byDay.length === 0) return null;

  const peak = Math.max(...byDay.map((day) => day.spent), 1);
  const first = byDay[0];

  return (
    <View style={{ paddingTop: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 5,
          height: STRIP_HEIGHT,
        }}
      >
        {byDay.map((day, index) => {
          const share = day.spent / peak;
          const last = index === byDay.length - 1;
          return (
            <View
              key={day.day}
              style={{
                flex: 1,
                height: `${Math.max(share, MIN_BAR) * 100}%`,
                borderRadius: theme.radius.barLg,
                // Today is the accent; the rest read as one mass, brighter the
                // heavier the day.
                backgroundColor: last
                  ? theme.palette.acc
                  : theme.colors[share > 0.6 ? 'bgElevated' : 'bgFloat'],
              }}
            />
          );
        })}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 7,
        }}
      >
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 11 }}
        >
          {first ? shortDate(first.day, language) : ''}
        </Text>
        <Text tabular color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
          {t('home.rhythm.today', { amount: formatMoney(spentToday) })}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 11 }}
        >
          {projected !== null ? t('home.rhythm.projected') : ''}
        </Text>
      </View>
    </View>
  );
}

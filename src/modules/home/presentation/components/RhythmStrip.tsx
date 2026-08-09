import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { DaySpend } from '@/modules/home/domain/types/HomeOverview';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

const STRIP_HEIGHT = 42;
/** How many real days the strip shows. The bundle draws twelve and labels the
 *  left edge with a date rather than the 1st — this is a rolling window, not the
 *  calendar month, which is what keeps the bars thick enough to read. */
const WINDOW = 12;
/** Two dashed bars past today: where the month is heading. */
const AHEAD = 2;
/** Enough to be visible on a day that cost nothing without reading as spending. */
const MIN_BAR = 0.08;

type Props = {
  byDay: DaySpend[];
  spentToday: number;
  /** The daily pace, used for the height of the projected bars. `null` in the
   *  month's first days, when a projection would be noise — and then the dashed
   *  bars do not appear at all. */
  dailyAverage: number | null;
  language: string;
};

/**
 * The last twelve days, then today, then where it is going.
 *
 * Not a chart to read values off — the shape of the recent past at a glance. The
 * bars carry no axis for that reason; three words underneath say where the window
 * starts, what today cost, and that the last two bars have not happened yet.
 *
 * Those two are drawn as outlines rather than fills, which is the whole point: a
 * solid bar is money that moved, and a projection is not. Nothing on this screen
 * should let the two be confused.
 */
export function RhythmStrip({ byDay, spentToday, dailyAverage, language }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const days = byDay.slice(-WINDOW);
  if (days.length === 0) return null;

  const peak = Math.max(...days.map((day) => day.spent), dailyAverage ?? 0, 1);
  const first = days[0];
  const ahead = dailyAverage === null ? 0 : AHEAD;

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
        {days.map((day, index) => {
          const share = Math.max(day.spent / peak, MIN_BAR);
          const isToday = index === days.length - 1;
          return (
            <View
              key={day.day}
              style={{
                flex: 1,
                height: `${share * 100}%`,
                borderRadius: theme.radius.barLg,
                backgroundColor: isToday
                  ? theme.palette.acc
                  : withAlpha(
                      theme.colors.textPrimary,
                      // The heavier the day, the brighter it reads.
                      share > 0.6 ? 0.18 : share > 0.4 ? 0.16 : 0.14,
                    ),
                ...(isToday
                  ? {
                      shadowColor: theme.palette.acc,
                      shadowOpacity: 0.45,
                      shadowRadius: 7,
                      shadowOffset: { width: 0, height: 0 },
                    }
                  : {}),
              }}
            />
          );
        })}

        {Array.from({ length: ahead }).map((_, index) => (
          <View
            key={`ahead-${index}`}
            style={{
              flex: 1,
              height: `${Math.max((dailyAverage ?? 0) / peak, MIN_BAR) * 100}%`,
              borderRadius: theme.radius.barLg,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: withAlpha(theme.colors.textPrimary, index === 0 ? 0.22 : 0.18),
            }}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 7,
        }}
      >
        <Text color={theme.colors.textTertiary} style={{ fontSize: 10.5 }}>
          {first ? shortDate(first.day, language) : ''}
        </Text>
        <Text tabular color={theme.colors.textSecondary} style={{ fontSize: 10.5 }}>
          {t('home.rhythm.today', { amount: formatMoney(spentToday) })}
        </Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 10.5 }}>
          {ahead > 0 ? t('home.rhythm.projected') : ''}
        </Text>
      </View>
    </View>
  );
}

import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatAmountDigits } from '@/shared/presentation/utils/formatMoney';

type Props = {
  spent: number;
  /** Signed share against the same stretch of last month. `null` on a first
   *  month — a zero there would read as "you spent the same". */
  change: number | null;
  monthName: string;
  onCortePress: () => void;
};

/**
 * The sentence, then the figure.
 *
 * The old hero led with the number and explained it underneath. This leads with
 * what the number MEANS — "vas 12% más liviana que el mes pasado" — because that
 * is the only part a person can act on, and the amount is right below for anyone
 * who wants it.
 *
 * On a first month there is nothing to compare against, so the sentence is about
 * the month itself. Inventing a trend from one data point would be the app
 * pretending to know the user better than it does.
 */
export function HomeHero({ spent, change, monthName, onCortePress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const pct = change === null ? null : Math.abs(Math.round(change * 100));
  const lighter = (change ?? 0) < 0;

  return (
    <View style={{ gap: 16 }}>
      <Text
        style={{
          fontSize: 25,
          lineHeight: 31,
          fontWeight: '300',
          letterSpacing: -0.7,
          color: theme.colors.textPrimary,
        }}
      >
        {pct === null ? (
          t('home.hero.firstMonth')
        ) : (
          <Trans
            i18nKey={lighter ? 'home.hero.lighter' : 'home.hero.heavier'}
            values={{ pct }}
            components={{ b: <Text style={{ fontSize: 25, fontWeight: '500' }} /> }}
          />
        )}
      </Text>

      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 7,
          }}
        >
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2 }}
          >
            {t('home.hero.spent')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onCortePress}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              color={theme.palette.acc3}
              style={{ fontSize: 11.5, fontWeight: '500' }}
            >
              {t('home.hero.corte', { month: monthName })}
            </Text>
            <Icon name="chevron-right" size={13} stroke={2.2} color={theme.palette.acc} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 19, fontWeight: '300' }}
          >
            $
          </Text>
          <Text
            tabular
            style={{
              fontSize: 38,
              fontWeight: '500',
              letterSpacing: -1.8,
              lineHeight: 40,
              color: theme.colors.textPrimary,
            }}
          >
            {formatAmountDigits(String(spent))}
          </Text>
        </View>
      </View>
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Cap } from '../../domain';

type Props = { cap: Cap; currency: CurrencyCode };

/**
 * Where the month lands, in a sentence.
 *
 * The redesign took the colour out of it, and that is the point. It used to be
 * an amber block with an alert triangle whenever a projection existed — over a
 * month closing *inside* its cap, a warning about nothing. Then a mint block
 * with a tick, which is a congratulation for being on the 12th.
 *
 * Now the two outcomes differ in what the sentence SAYS, not in what colour it
 * is. A card that changes colour trains you to read the colour; a card that
 * always looks the same makes you read the words, which are the part that
 * actually knows something.
 *
 * A `null` projection renders nothing at all: in the first days of a month a
 * single bill would forecast a month of them.
 */
export function ProjectionCallout({ cap, currency }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (cap.projected === null) return null;

  const over = cap.over !== null;
  const gap = cap.over ?? cap.target - cap.projected;

  return (
    <View
      style={{
        padding: 15,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <Text style={{ fontSize: 14.5, lineHeight: 22.5, fontWeight: '300' }}>
        {t('budgets.projection.willEnd')}{' '}
        <Text tabular style={{ fontSize: 14.5, fontWeight: '500' }}>
          {formatMoney(cap.projected, currency)}
        </Text>
        {t('budgets.projection.atClose')}{' '}
        {t(over ? 'budgets.projection.overBy' : 'budgets.projection.underBy', {
          amount: formatMoney(gap, currency),
        })}
      </Text>
    </View>
  );
}

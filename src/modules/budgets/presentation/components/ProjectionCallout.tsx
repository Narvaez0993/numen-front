import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Cap } from '../../domain';

type Props = { cap: Cap };

/**
 * Where the month lands, compared to the cap — the sentence that makes having both
 * numbers worth it.
 *
 * It has two faces because the projection has two outcomes. It used to have one: an amber
 * alert triangle reading "you will end at $X" no matter what, which over a month closing
 * *inside* its cap was a warning about nothing. A `null` projection (the first days of a
 * month, when a single bill would forecast a month of them) renders nothing at all.
 */
export function ProjectionCallout({ cap }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (cap.projected === null) return null;

  const over = cap.over !== null;
  const gap = cap.over ?? cap.target - cap.projected;
  const accent = over ? theme.colors.accentAmber : theme.colors.accentMint;

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        backgroundColor: over ? theme.colors.accentAmberBg : theme.colors.accentMintBg,
        borderColor: over ? 'rgba(255, 181, 71, 0.18)' : 'rgba(94, 234, 190, 0.18)',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={over ? 'alert-triangle' : 'check'}
          size={18}
          color={theme.colors.bgBase}
          stroke={1.9}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="label" style={{ fontSize: 12.5, marginBottom: 2 }}>
          {t('budgets.projection.willEnd')}{' '}
          <Text variant="label" color={accent} tabular style={{ fontSize: 12.5 }}>
            {formatMoney(cap.projected)}
          </Text>
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 11.5 }}
        >
          <Text variant="caption" tabular style={{ fontWeight: '500', fontSize: 11.5 }}>
            {formatMoney(gap)}
          </Text>{' '}
          {t(over ? 'budgets.projection.over' : 'budgets.projection.under')}
        </Text>
      </View>
    </View>
  );
}

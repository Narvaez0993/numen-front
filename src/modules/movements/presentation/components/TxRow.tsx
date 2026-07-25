import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Movement } from '../../domain';
import type { ResolvedCategory, ResolvedSource } from '../hooks/useMovementCatalogs';

type Props = {
  movement: Movement;
  category: ResolvedCategory | undefined;
  source: ResolvedSource | undefined;
  last: boolean;
};

/** Fallback for a reference the catalogs could not resolve (deleted source). */
const UNKNOWN_ICON = 'dots';

export function TxRow({ movement, category, source, last }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isTransfer = movement.type === 'transfer';
  const isIncome = movement.type === 'income';
  const lineColor = isTransfer ? theme.colors.textTertiary : theme.colors.textPrimary;
  const amountColor = isTransfer
    ? theme.colors.textTertiary
    : isIncome
      ? theme.colors.accentMint
      : theme.colors.textPrimary;

  const icon = isTransfer ? 'refresh' : (category?.icon ?? source?.icon ?? UNKNOWN_ICON);
  const iconColor = isTransfer ? 'mint' : (category?.color ?? source?.color ?? 'mint');
  const subtitle = isTransfer
    ? t('movements.transferTag')
    : [category?.name, source?.name].filter(Boolean).join(' · ');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: isTransfer ? 0.65 : 1,
      }}
    >
      <IconBox name={icon} color={iconColor} size={34} iconSize={16} radius={10} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" color={lineColor} numberOfLines={1}>
          {movement.description}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text variant="bodyLarge" tabular color={amountColor}>
        {isIncome ? '+' : ''}
        {formatMoney(movement.amount, movement.currency)}
      </Text>
    </View>
  );
}

import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import type { CurrencyCode } from '@/shared/domain';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Movement } from '../../domain';
import type { MovementCatalogs } from '../hooks/useMovementCatalogs';
import { displaySource } from '../hooks/useMovementCatalogs';
import type { DayGroup as DayGroupModel } from '../utils/groupByDay';

import { TxRow } from './TxRow';

type Props = {
  group: DayGroupModel;
  catalogs: MovementCatalogs;
  currency: CurrencyCode;
  onItemPress?: (movement: Movement) => void;
};

export function DayGroup({ group, catalogs, currency, onItemPress }: Props) {
  const { theme } = useTheme();
  const borderColor = theme.colors.borderDefault;
  const tertiary = theme.colors.textTertiary;

  return (
    <View>
      {/* The day is a rule across the list, not a label above a card: the
          heading and its total sit on the line the rows hang from. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingTop: 18,
          paddingBottom: 9,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '500' }}>{group.label}</Text>
        <Text tabular color={tertiary} style={{ fontSize: 11.5 }}>
          {group.total >= 0 ? '+' : ''}
          {formatMoney(group.total, currency)}
        </Text>
      </View>

      <View>
        {group.items.map((movement, i) => (
          <TxRow
            key={movement.id}
            movement={movement}
            category={
              movement.categoryId ? catalogs.categoryById[movement.categoryId] : undefined
            }
            source={displaySource(catalogs, movement.source, movement.destination)}
            last={i === group.items.length - 1}
            onPress={onItemPress ? () => onItemPress(movement) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

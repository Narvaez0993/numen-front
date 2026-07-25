import { View } from 'react-native';

import { Card, Text } from '@/shared/presentation/components';
import type { CurrencyCode } from '@/shared/domain';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { MovementCatalogs } from '../hooks/useMovementCatalogs';
import { displaySource } from '../hooks/useMovementCatalogs';
import type { DayGroup as DayGroupModel } from '../utils/groupByDay';

import { TxRow } from './TxRow';

type Props = {
  group: DayGroupModel;
  catalogs: MovementCatalogs;
  currency: CurrencyCode;
};

export function DayGroup({ group, catalogs, currency }: Props) {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          paddingBottom: 8,
          gap: 12,
        }}
      >
        <Text variant="micro" uppercase style={{ fontSize: 11, letterSpacing: 1.1 }}>
          {group.label}
        </Text>
        <Text
          variant="caption"
          muted
          tabular
          style={{ fontSize: 11.5, fontWeight: '500' }}
        >
          {formatMoney(group.total, currency)}
        </Text>
      </View>

      <Card padding={0}>
        {group.items.map((movement, i) => (
          <TxRow
            key={movement.id}
            movement={movement}
            category={
              movement.categoryId ? catalogs.categoryById[movement.categoryId] : undefined
            }
            source={displaySource(catalogs, movement.source, movement.destination)}
            last={i === group.items.length - 1}
          />
        ))}
      </Card>
    </View>
  );
}

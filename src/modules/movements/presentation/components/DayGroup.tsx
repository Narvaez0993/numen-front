import { View } from 'react-native';

import { Card, Text } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { DayGroup as DayGroupModel } from '../utils/groupByDay';

import { TxRow } from './TxRow';

type Props = {
  group: DayGroupModel;
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
};

const HEADER_LABELS: Record<string, [string, string]> = {
  hoy: ['HOY', 'mar 14 may'],
  ayer: ['AYER', 'lun 13 may'],
};

function formatHeader(group: DayGroupModel): [string, string] {
  const known = HEADER_LABELS[group.dayBucket];
  if (known) return known;
  return [group.dayBucket.toUpperCase(), ''];
}

export function DayGroup({ group, categories, accounts }: Props) {
  const [label, sub] = formatHeader(group);

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Text variant="micro" uppercase style={{ fontSize: 11, letterSpacing: 1.1 }}>
            {label}
          </Text>
          {sub ? (
            <Text
              variant="micro"
              muted
              uppercase
              style={{ fontSize: 10.5, letterSpacing: 0.84 }}
            >
              · {sub}
            </Text>
          ) : null}
        </View>
        <Text
          variant="caption"
          muted
          tabular
          style={{ fontSize: 11.5, fontWeight: '500' }}
        >
          {formatCOP(group.total)}
        </Text>
      </View>

      <Card padding={0}>
        {group.items.map((tx, i) => {
          const category = categories[tx.categoryId];
          const account = accounts[tx.accountId];
          if (!category || !account) return null;
          return (
            <TxRow
              key={tx.id}
              tx={tx}
              category={category}
              account={account}
              last={i === group.items.length - 1}
            />
          );
        })}
      </Card>
    </View>
  );
}

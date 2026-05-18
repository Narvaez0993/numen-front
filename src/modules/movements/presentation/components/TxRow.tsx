import { View } from 'react-native';

import { IconBox, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { Transaction } from '../../domain/types/Transaction';

type Props = {
  tx: Transaction;
  category: Category;
  account: Account;
  last: boolean;
};

export function TxRow({ tx, category, account, last }: Props) {
  const { theme } = useTheme();
  const isTransfer = tx.tag === 'transfer';
  const lineColor = isTransfer ? theme.colors.textTertiary : theme.colors.textPrimary;

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
      {isTransfer ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: 'rgba(168,178,200,0.10)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBox
            name={category.iconName}
            color="mint"
            size={34}
            iconSize={16}
            radius={10}
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
      ) : (
        <IconBox
          name={category.iconName}
          color={category.color === 'neutral' ? 'mint' : category.color}
          size={34}
          iconSize={16}
          radius={10}
        />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            variant="bodyLarge"
            color={lineColor}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {tx.description}
          </Text>
          {tx.tag === 'recurrente' ? (
            <Pill variant="amber" style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
              recurrente
            </Pill>
          ) : null}
        </View>
        <Text variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
          {isTransfer
            ? 'Transferencia · no es gasto'
            : `${category.name} · ${account.short} · ${tx.time}`}
        </Text>
      </View>
      <Text variant="bodyLarge" tabular color={lineColor}>
        {formatCOP(tx.amount)}
      </Text>
    </View>
  );
}

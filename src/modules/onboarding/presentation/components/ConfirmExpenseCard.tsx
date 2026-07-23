import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { OnboardingExpense } from '../../domain/types/OnboardingContext';

import { MiniInfoCard } from './MiniInfoCard';

type Props = {
  expense: OnboardingExpense;
  whenLabel: string;
  categoryLabel: string;
  accountLabel: string;
  accountValue: string;
};

export function ConfirmExpenseCard({
  expense,
  whenLabel,
  categoryLabel,
  accountLabel,
  accountValue,
}: Props) {
  const { theme } = useTheme();
  const bgKey = accentColorKey(expense.color, 'bg');
  const fgKey = accentColorKey(expense.color, 'fg');

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 2,
        borderColor: 'rgba(0, 229, 168, 0.3)',
        borderRadius: 18,
        padding: 16,
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: theme.colors[bgKey],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={expense.icon} size={22} stroke={1.8} color={theme.colors[fgKey]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge" style={{ fontSize: 15 }} numberOfLines={1}>
            {expense.desc}
          </Text>
          <Text variant="caption" muted style={{ fontSize: 11.5, marginTop: 2 }}>
            {whenLabel}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
          <Text variant="caption" muted style={{ fontSize: 11, marginRight: 2 }}>
            $
          </Text>
          <Text variant="display" tabular style={{ fontSize: 22, lineHeight: 24 }}>
            {expense.amount.toLocaleString('es-CO').replace(/,/g, '.')}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <MiniInfoCard label={categoryLabel} value={expense.cat} />
        <MiniInfoCard label={accountLabel} value={accountValue} />
      </View>
    </View>
  );
}

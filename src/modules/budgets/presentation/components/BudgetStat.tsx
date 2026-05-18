import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  value: string;
  variant?: 'primary' | 'mint';
};

export function BudgetStat({ label, value, variant = 'primary' }: Props) {
  const { theme } = useTheme();
  const valueColor =
    variant === 'mint' ? theme.colors.accentMint : theme.colors.textPrimary;

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: theme.colors.bgFloat,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text
        variant="micro"
        muted
        uppercase
        style={{ fontSize: 10, letterSpacing: 0.8, marginBottom: 4 }}
      >
        {label}
      </Text>
      <Text
        variant="label"
        color={valueColor}
        tabular
        numberOfLines={1}
        style={{ fontSize: 15 }}
      >
        {value}
      </Text>
    </View>
  );
}

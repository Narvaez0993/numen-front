import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  value: string;
  sub?: string;
};

/**
 * One figure the answer leans on.
 *
 * It used to take a colour per stat, which put a green number beside an amber
 * one in the same answer and made the pair look like a verdict. The redesign is
 * monochrome: the figure is ink, and whether it is good news is what the
 * sentence above it is for.
 */
export function RichStat({ label, value, sub }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        padding: 16,
        paddingVertical: 14,
        borderRadius: 20,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <Text
        variant="micro"
        uppercase
        color={theme.colors.textTertiary}
        numberOfLines={1}
        style={{ letterSpacing: 1.6, marginBottom: 8 }}
      >
        {label}
      </Text>
      <Text
        tabular
        numberOfLines={1}
        style={{ fontSize: 23, fontWeight: '500', letterSpacing: -1 }}
      >
        {value}
      </Text>
      {sub ? (
        <Text
          color={theme.colors.textTertiary}
          numberOfLines={1}
          style={{ fontSize: 11, marginTop: 6 }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

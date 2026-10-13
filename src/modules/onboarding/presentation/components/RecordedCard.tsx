import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  title: string;
  /** Already formatted, sign included: «−$18.000», «+$2.950.000». */
  amount: string;
  /** What the app filled in by itself: category, account, day. */
  chips: string[];
  income?: boolean;
  compact?: boolean;
};

/**
 * A movement as the design's «Ya quedó» draws it: what, how much, and the
 * three things the app decided on its own.
 *
 * The same card for the welcome's demonstration and for the first expense the
 * user really records — what the demo promised is exactly what they get.
 */
export function RecordedCard({
  title,
  amount,
  chips,
  income = false,
  compact = false,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingVertical: compact ? 13 : 16,
        paddingHorizontal: compact ? 15 : 18,
        borderRadius: 22,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: withAlpha(theme.palette.acc, 0.3),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: compact ? 10 : 13,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontSize: compact ? 15 : 16, fontWeight: '500' }}
        >
          {title}
        </Text>
        <Text
          tabular
          color={income ? theme.colors.accentMint : theme.colors.textPrimary}
          style={{ fontSize: compact ? 17 : 19, fontWeight: '500', letterSpacing: -0.5 }}
        >
          {amount}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {chips.map((chip, index) => (
          <View
            key={`${index}-${chip}`}
            style={{
              minHeight: 30,
              justifyContent: 'center',
              paddingHorizontal: 11,
              borderRadius: 12,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
            }}
          >
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12 }}>
              {chip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

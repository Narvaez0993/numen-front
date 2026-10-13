import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

export type DetectedChip = {
  key: string;
  label: string;
  /** A chip with no `onPress` is a statement, not a choice — the design uses it
   *  for "Deuda a tu favor", which is what the sentence WAS, not a field. */
  onPress?: () => void;
  fixed?: boolean;
};

type Props = {
  title: string;
  amount: string;
  /** `−` or `+`; income is the only one that also changes colour. */
  sign: string;
  income?: boolean;
  chips: DetectedChip[];
  /** Highlighted border: the design marks a card that just appeared. */
  fresh?: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

/**
 * One thing the agent understood, small enough that three fit on a screen.
 *
 * This replaced a full-size card with its own confirm button, and the reason is
 * arithmetic: a capture routinely holds three things, and three cards that each
 * ask to be confirmed is three decisions plus scrolling. Here the whole capture
 * is confirmed once, at the bottom, and each card only has to be readable and
 * correctable.
 *
 * Correcting is the point of the chips. Every editable field is one tap away in
 * place — no sheet, no form — which is what makes "toca cualquier dato para
 * corregirlo" true rather than aspirational.
 */
export function DetectedCard({
  title,
  amount,
  sign,
  income = false,
  chips,
  fresh = false,
  onEdit,
  onRemove,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        padding: 15,
        paddingHorizontal: 16,
        borderRadius: 22,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: fresh
          ? withAlpha(theme.palette.acc, 0.26)
          : theme.colors.borderSubtle,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onEdit}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          minHeight: 32,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
          {title}
        </Text>
        <Text
          tabular
          color={income ? theme.colors.accentMint : theme.colors.textPrimary}
          style={{ fontSize: 17, fontWeight: '500' }}
        >
          {sign}
          {amount}
        </Text>
        <Icon name="pencil" size={13} stroke={1.9} color={theme.colors.textTertiary} />
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          // Negative margins keep the 44px tap target without the design's row
          // growing around it.
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            marginVertical: -7,
            marginRight: -13,
            marginLeft: -4,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="x" size={14} stroke={2} color={theme.colors.textTertiary} />
        </Pressable>
      </Pressable>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {chips.map((chip) => (
          <Chip key={chip.key} chip={chip} />
        ))}
      </View>
    </View>
  );
}

function Chip({ chip }: { chip: DetectedChip }) {
  const { theme } = useTheme();

  if (chip.fixed) {
    return (
      <View
        style={{
          minHeight: 34,
          justifyContent: 'center',
          paddingHorizontal: 11,
          borderRadius: 12,
          backgroundColor: withAlpha(theme.palette.acc, 0.14),
        }}
      >
        <Text color={theme.palette.acc2} style={{ fontSize: 12 }}>
          {chip.label}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={chip.onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 34,
        paddingHorizontal: 11,
        borderRadius: 12,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text color={theme.colors.textSecondary} style={{ fontSize: 12 }}>
        {chip.label}
      </Text>
      <Icon
        name="chevron-down"
        size={11}
        stroke={2.4}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

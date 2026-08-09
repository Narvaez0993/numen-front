import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

/**
 * The three controls both confirm cards are built from.
 *
 * They live together because a movement card and a debt card ask the same three
 * things in the same moment — say yes, back out, pick one of these — and the old
 * pair drifted apart: one used a mint `Button`, the other raw `Pressable`s, and
 * the chips were mint here and bordered there. Shared parts mean the answer to
 * "what does a choice look like?" cannot have two answers.
 */

/** The yes. The only filled surface on the card, so there is never a question
 *  about which control commits the money. */
export function ConfirmButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled: boolean;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 46,
        borderRadius: 15,
        backgroundColor: theme.palette.acc,
        opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
      })}
    >
      <Icon name="check" size={16} stroke={2.2} color={theme.colors.bgBase} />
      <Text color={theme.colors.bgBase} style={{ fontSize: 14, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Edit and discard are escape hatches, not the point of the card — they get the
 *  tap target they need and none of the weight. */
export function QuietAction({
  label,
  onPress,
  disabled,
  danger = false,
}: {
  label: string;
  onPress?: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        minHeight: 46,
        justifyContent: 'center',
        paddingHorizontal: 10,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        color={danger ? theme.colors.accentCoral : theme.colors.textSecondary}
        style={{ fontSize: 13 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** One option among several. Selected is the accent at 15%, exactly as a filter
 *  chip reads elsewhere — a filled mint pill used to look like a confirmation. */
export function PickChip({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 40,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active
          ? withAlpha(theme.palette.acc, 0.15)
          : theme.colors.bgFloat,
        borderColor: active
          ? withAlpha(theme.palette.acc, 0.3)
          : theme.colors.borderSubtle,
        borderWidth: 1,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        color={active ? theme.palette.acc2 : theme.colors.textSecondary}
        style={{ fontSize: 13 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** The label above a group of choices. */
export function AskLabel({ children }: { children: string }) {
  const { theme } = useTheme();

  return (
    <Text
      variant="micro"
      uppercase
      color={theme.colors.textTertiary}
      style={{ letterSpacing: 2 }}
    >
      {children}
    </Text>
  );
}

/** The card body every draft sits in. */
export function DraftShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
        gap: 14,
      }}
    >
      {children}
    </View>
  );
}

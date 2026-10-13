import { ActivityIndicator, Pressable } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Swaps the label for a spinner and stops a second tap from firing. */
  loading?: boolean;
  /** A leading glyph, e.g. the microphone on «Cuéntame un gasto». */
  icon?: string;
  /** 56 on the entry screens, where it is the only thing to do; 52 elsewhere. */
  height?: number;
};

/**
 * The design's primary action: the one solid, untinted surface on a screen.
 *
 * It is ink rather than a colour — near-white over the night, near-black over
 * the day — so it never competes with the palette's accent, which is kept for
 * links and states. The green button it replaces made every primary action look
 * like the app's money-coming-in colour.
 */
export function InkButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  height = 52,
}: Props) {
  const { theme } = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => ({
        minHeight: height,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 11,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: theme.colors.textPrimary,
        opacity: disabled ? 0.4 : pressed ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.bgBase} />
      ) : (
        <>
          {icon !== undefined ? (
            <Icon name={icon} size={18} stroke={2} color={theme.colors.bgBase} />
          ) : null}
          <Text color={theme.colors.bgBase} style={{ fontSize: 14.5, fontWeight: '600' }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

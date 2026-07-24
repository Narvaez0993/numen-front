import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

const SPRING = { damping: 17, stiffness: 190, mass: 0.7 };

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

/**
 * Single hidden input rendered as N boxes — the robust pattern for paste and
 * iOS SMS autofill. Boxes animate focus/fill; the row shakes on `error`.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error = false,
  disabled = false,
  autoFocus = true,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const prevLength = useRef(value.length);
  const shake = useSharedValue(0);

  const cells = useMemo(() => Array.from({ length }), [length]);

  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(id);
  }, [autoFocus]);

  useEffect(() => {
    if (!error) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(-6, { duration: 45 }),
      withTiming(6, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [error, shake]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, length);
    if (digits.length > prevLength.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    prevLength.current = digits.length;
    onChange(digits);
    if (digits.length === length) {
      onComplete?.(digits);
    }
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={disabled}>
      <Animated.View style={[styles.row, rowStyle]}>
        {cells.map((_, index) => (
          <OtpCell
            key={index}
            char={value[index] ?? ''}
            active={index === value.length && !error}
            filled={index < value.length}
            hasError={error}
          />
        ))}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        editable={!disabled}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

type CellProps = {
  char: string;
  active: boolean;
  filled: boolean;
  hasError: boolean;
};

function OtpCell({ char, active, filled, hasError }: CellProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(active ? 1.06 : 1, SPRING);
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColor = hasError
    ? theme.colors.accentCoral
    : active
      ? theme.colors.accentMint
      : filled
        ? theme.colors.borderDefault
        : theme.colors.borderSubtle;

  return (
    <Animated.View
      style={[
        styles.cell,
        animatedStyle,
        {
          backgroundColor: theme.colors.bgSurface,
          borderColor,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text variant="h2" style={{ color: theme.colors.textPrimary }}>
        {char}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 58,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
});

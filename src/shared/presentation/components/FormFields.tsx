import type { ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { CurrencyCode } from '../currency/useCurrencyStore';
import { useTheme } from '../theme';
import { currencySymbol, formatAmountDigits } from '../utils/formatMoney';

import { Icon } from './Icon';
import { Text } from './Text';

export function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      variant="micro"
      muted
      uppercase
      style={{ fontSize: 10.5, letterSpacing: 1.05, marginBottom: 8 }}
    >
      {label}
    </Text>
  );
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textTertiary}
      autoFocus={autoFocus}
      style={{
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: theme.colors.textPrimary,
        fontFamily: 'Geist_400Regular',
      }}
    />
  );
}

/**
 * Money input. `digits` are the raw keystrokes, read as the **minor unit** of the
 * currency: in USD typing `45000` shows `$450.00`, in COP `$450.000`.
 */
/**
 * An amount, boxed like any other field or leading a screen.
 *
 * `hero` drops the box entirely. Where the amount IS the thing being edited —
 * a movement's detail, the manual form — a border around it says "one field
 * among several", and the typography has to carry the hierarchy instead.
 */
export function AmountField({
  digits,
  onChangeDigits,
  currency,
  size = 'field',
}: {
  digits: string;
  onChangeDigits: (digits: string) => void;
  currency?: CurrencyCode;
  size?: 'field' | 'hero';
}) {
  const { theme } = useTheme();
  const hero = size === 'hero';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: hero ? 'baseline' : 'center',
        gap: hero ? 4 : 4,
        ...(hero
          ? {}
          : {
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }),
      }}
    >
      <Text
        tabular
        color={hero ? theme.colors.textTertiary : theme.colors.textPrimary}
        style={{ fontSize: hero ? 21 : 15, fontWeight: hero ? '300' : '500' }}
      >
        {currencySymbol(currency)}
      </Text>
      <TextInput
        value={formatAmountDigits(digits, currency)}
        onChangeText={(v) => onChangeDigits(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          flex: 1,
          fontSize: hero ? 44 : 15,
          lineHeight: hero ? 48 : undefined,
          letterSpacing: hero ? -2.2 : undefined,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_500Medium',
          fontVariant: ['tabular-nums'],
          padding: 0,
        }}
      />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels: Record<T, string>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.bgFloat,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 12,
        padding: 3,
        gap: 3,
      }}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              borderRadius: 9,
              backgroundColor: active ? theme.colors.bgElevated : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: theme.colors.borderDefault,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              variant="label"
              color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
              style={{ fontSize: 12 }}
            >
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SelectRow({
  label,
  value,
  valueColor,
  expanded,
  onToggle,
  last = false,
  children,
}: {
  label: string;
  value: string;
  valueColor?: string;
  expanded: boolean;
  onToggle: () => void;
  last?: boolean;
  children: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderBottomWidth: last && !expanded ? 0 : last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 13,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="caption" muted>
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            variant="label"
            color={valueColor ?? theme.colors.textPrimary}
            style={{ fontSize: 12.5 }}
          >
            {value}
          </Text>
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={13}
            color={theme.colors.textTertiary}
          />
        </View>
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

export function DeleteFlow({
  label,
  confirmTitle,
  confirmLabel,
  cancelLabel,
  confirming,
  onToggle,
  onConfirm,
}: {
  label: string;
  confirmTitle: string;
  confirmLabel: string;
  cancelLabel: string;
  confirming: boolean;
  onToggle: (confirming: boolean) => void;
  onConfirm: () => void;
}) {
  const { theme } = useTheme();

  if (!confirming) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => onToggle(true)}
        style={({ pressed }) => ({
          alignItems: 'center',
          paddingVertical: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="label" color={theme.colors.accentCoral} style={{ fontSize: 13 }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{ gap: 10, alignItems: 'center', paddingTop: 4 }}>
      <Text variant="caption" color={theme.colors.textSecondary}>
        {confirmTitle}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onToggle(false)}
          style={({ pressed }) => ({
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderDefault,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text variant="label" style={{ fontSize: 12.5 }}>
            {cancelLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onConfirm}
          style={({ pressed }) => ({
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 12,
            backgroundColor: theme.colors.accentCoralBg,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.accentCoral}
            style={{ fontSize: 12.5 }}
          >
            {confirmLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

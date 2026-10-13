import { TextInput } from 'react-native';

import { useTheme } from '../theme';

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

import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 13,
      }}
    >
      <Icon name="search" size={16} color={theme.colors.textTertiary} stroke={1.8} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          flex: 1,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
          fontSize: 13,
          padding: 0,
        }}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={6}>
          <Icon name="x" size={14} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function CategorySearchBar({ value, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 13,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 14,
      }}
    >
      <Icon name="search" size={15} stroke={1.8} color={theme.colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t('categories.searchPlaceholder')}
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          flex: 1,
          color: theme.colors.textPrimary,
          fontSize: 13,
          fontFamily: 'Geist_400Regular',
          padding: 0,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={8}
          style={({ pressed }) => ({ padding: 2, opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="x" size={13} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

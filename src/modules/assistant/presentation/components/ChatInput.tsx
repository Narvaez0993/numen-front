import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChangeText, onSend, disabled = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        paddingLeft: 14,
        paddingRight: 8,
        paddingVertical: 8,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => {
          if (canSend) onSend();
        }}
        editable={!disabled}
        placeholder={t('assistant.inputPlaceholder')}
        placeholderTextColor={theme.colors.textTertiary}
        returnKeyType="send"
        style={{
          flex: 1,
          minWidth: 0,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
          fontSize: 13.5,
          paddingVertical: 4,
        }}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: canSend ? theme.colors.accentMint : theme.colors.bgElevated,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: canSend && pressed ? 0.85 : 1,
        })}
      >
        <Icon
          name="send"
          size={15}
          color={canSend ? '#0A0E1A' : theme.colors.textTertiary}
          stroke={2}
        />
      </Pressable>
    </View>
  );
}

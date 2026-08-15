import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  disabled?: boolean;
};

/**
 * The bar you ask from: a pill, an attach button, and one round action.
 *
 * **The action is send, not a microphone.** The design draws a mic there, and
 * dictation belongs on this screen — but the orb in the tab bar already opens
 * the capture menu, where speaking is the first option and has a whole screen to
 * do it in. A second, smaller entrance to the same thing would be two doors to
 * one room, and the one you can actually type into is the one this bar is for.
 * The button turns solid the moment there is something to send.
 *
 * Attaching a photo of a receipt is drawn too and is a feature rather than a
 * skin, so it keeps its place and says "pronto" — the shape of the bar is final
 * even where what is behind a button is not.
 */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onAttach,
  disabled = false,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const ready = value.trim().length > 0 && !disabled;

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 7,
          paddingLeft: 8,
          borderRadius: 27,
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: ready
            ? withAlpha(theme.palette.acc, 0.3)
            : theme.colors.borderSubtle,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('assistant.composer.attach')}
          onPress={onAttach}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.bgSurface,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="photo" size={19} stroke={1.8} color={theme.colors.textSecondary} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={() => ready && onSend()}
          editable={!disabled}
          placeholder={t('assistant.composer.placeholder')}
          placeholderTextColor={theme.colors.textTertiary}
          selectionColor={theme.palette.acc}
          returnKeyType="send"
          multiline
          style={{
            flex: 1,
            minWidth: 0,
            maxHeight: 96,
            fontSize: 13.5,
            color: theme.colors.textPrimary,
            fontFamily: 'Geist_400Regular',
            padding: 0,
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('assistant.composer.send')}
          accessibilityState={{ disabled: !ready }}
          onPress={onSend}
          disabled={!ready}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ready ? theme.palette.acc : theme.colors.bgSurface,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon
            name="arrow-up"
            size={20}
            stroke={2}
            color={ready ? theme.colors.bgBase : theme.colors.textTertiary}
          />
        </Pressable>
      </View>

      <Text
        color={theme.colors.textTertiary}
        style={{ fontSize: 10.5, textAlign: 'center', marginTop: 9 }}
      >
        {t('assistant.composer.hint')}
      </Text>
    </View>
  );
}

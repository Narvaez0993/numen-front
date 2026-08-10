import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountKeypad,
  Icon,
  KeypadAmount,
  Text,
  pressAmountKey,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  visible: boolean;
  /** Digits, not a number — the same string the keypad appends to. */
  digits: string;
  description: string;
  currency?: CurrencyCode;
  sign: string;
  income?: boolean;
  onClose: () => void;
  onRemove: () => void;
  onDone: (next: { digits: string; description: string }) => void;
};

/**
 * Correcting one detected thing.
 *
 * A sheet rather than a screen because it is a step inside a capture, not a
 * departure from it: the cards stay visible behind the scrim, so the thing being
 * fixed keeps its place in the list of three.
 *
 * "Quitar" sits in the header next to the title, which looks unbalanced until
 * you notice what it prevents: without it, deleting something the agent got
 * wrong means backing out, finding the card, and hitting its ×. The correction
 * sheet is exactly where you find out something should not exist.
 */
export function CorrectSheet({
  visible,
  digits,
  description,
  currency,
  sign,
  income = false,
  onClose,
  onRemove,
  onDone,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [draftDigits, setDraftDigits] = useState(digits);
  const [draftDescription, setDraftDescription] = useState(description);
  const [editingName, setEditingName] = useState(false);

  // The sheet stays mounted between cards; each opening has to start from the
  // card it was opened for, not from whatever the last one left behind.
  useEffect(() => {
    if (visible) {
      setDraftDigits(digits);
      setDraftDescription(description);
      setEditingName(false);
    }
  }, [visible, digits, description]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          style={{ flex: 1, backgroundColor: theme.colors.scrim }}
        />

        <View
          style={{
            // The design pins the sheet 150px from the top rather than sizing it
            // to its content: the keypad must land in the same place every time.
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 150,
            borderTopLeftRadius: 34,
            borderTopRightRadius: 34,
            backgroundColor: theme.colors.bgElevated,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderDefault,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <View
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.borderDefault,
                alignSelf: 'center',
                marginTop: 12,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 20,
                paddingTop: 16,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.bgSurface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Icon name="x" size={15} stroke={2} color={theme.colors.textSecondary} />
              </Pressable>

              <Text style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
                {t('expenses.correct.title')}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={onRemove}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 40,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: withAlpha(theme.colors.accentCoral, 0.12),
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Icon
                  name="trash"
                  size={14}
                  stroke={1.9}
                  color={theme.colors.accentCoral}
                />
                <Text
                  color={theme.colors.accentCoral}
                  style={{ fontSize: 12.5, fontWeight: '500' }}
                >
                  {t('expenses.correct.remove')}
                </Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
              <KeypadAmount
                digits={draftDigits}
                currency={currency}
                sign={sign}
                size="correct"
                color={income ? theme.colors.accentMint : theme.colors.textPrimary}
              />
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditingName(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 44,
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderRadius: 16,
                  backgroundColor: theme.colors.bgSurface,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                }}
              >
                <Text color={theme.colors.textTertiary} style={{ fontSize: 13.5 }}>
                  {t('expenses.correct.what')}
                </Text>
                {editingName ? (
                  <TextInput
                    value={draftDescription}
                    onChangeText={setDraftDescription}
                    autoFocus
                    onBlur={() => setEditingName(false)}
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      fontSize: 13.5,
                      color: theme.colors.textPrimary,
                      fontFamily: 'Geist_400Regular',
                      padding: 0,
                    }}
                  />
                ) : (
                  <Text
                    numberOfLines={1}
                    style={{ flex: 1, textAlign: 'right', fontSize: 13.5 }}
                  >
                    {draftDescription}
                  </Text>
                )}
                <Icon
                  name="pencil"
                  size={14}
                  stroke={1.9}
                  color={theme.colors.textTertiary}
                />
              </Pressable>
            </View>

            <View style={{ flex: 1 }} />

            <View style={{ paddingHorizontal: 20 }}>
              <AmountKeypad
                onKey={(key) => setDraftDigits((current) => pressAmountKey(current, key))}
              />
            </View>

            <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 32 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  onDone({ digits: draftDigits, description: draftDescription.trim() })
                }
                style={({ pressed }) => ({
                  minHeight: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 18,
                  backgroundColor: theme.colors.textPrimary,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  color={theme.colors.bgBase}
                  style={{ fontSize: 14, fontWeight: '600' }}
                >
                  {t('common.done')}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

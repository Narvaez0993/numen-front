import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  Icon,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
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
    <AmountSheet
      visible={visible}
      onClose={onClose}
      size="correct"
      digits={draftDigits}
      onDigits={setDraftDigits}
      currency={currency}
      sign={sign}
      amountColor={income ? theme.colors.accentMint : theme.colors.textPrimary}
      primaryLabel={t('common.done')}
      onPrimary={() =>
        onDone({ digits: draftDigits, description: draftDescription.trim() })
      }
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
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
            <Icon name="trash" size={14} stroke={1.9} color={theme.colors.accentCoral} />
            <Text
              color={theme.colors.accentCoral}
              style={{ fontSize: 12.5, fontWeight: '500' }}
            >
              {t('expenses.correct.remove')}
            </Text>
          </Pressable>
        </>
      }
    >
      <SheetFieldRow
        label={t('expenses.correct.what')}
        onPress={() => setEditingName(true)}
      >
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
          <Text numberOfLines={1} style={{ flex: 1, textAlign: 'right', fontSize: 13.5 }}>
            {draftDescription}
          </Text>
        )}
        {/* A pencil, not a chevron: this row types rather than picks. */}
        <Icon name="pencil" size={14} stroke={1.9} color={theme.colors.textTertiary} />
      </SheetFieldRow>
    </AmountSheet>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';

import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { useTheme } from '../theme';
import { withAlpha } from '../theme/tokens';

import { AmountKeypad, pressAmountKey } from './AmountKeypad';
import { Icon } from './Icon';
import { KeypadAmount } from './KeypadAmount';
import { RiseIn } from './RiseIn';
import { SHEET_TOP, SheetShell } from './SheetShell';
import { Text } from './Text';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** The whole header row. It is the one part that genuinely differs: a back
   *  arrow and a type switcher here, a title and a Quitar there. */
  header: React.ReactNode;
  /** Micro label over the amount — "Techo del mes", "Tope de Mercado". */
  label?: string;
  digits: string;
  onDigits: (next: string) => void;
  currency?: CurrencyCode;
  sign?: string;
  amountColor?: string;
  size?: 'sheet' | 'correct';
  /** Replaces the currency symbol — `''` for a field that is not money. */
  symbol?: string;
  /** How many digits the pad will accept. Two for a day of the month. */
  maxDigits?: number;
  /** One line under the amount explaining what the number will do. */
  help?: string;
  /** Field rows between the amount and the keypad. */
  children?: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Shows the mic beside the save button. Absent on sheets where speaking makes
   *  no sense — you cannot dictate a ceiling. */
  onMic?: () => void;
  /**
   * Takes over everything below the header — the amount, the fields, the pad and
   * the footer all go.
   *
   * It is how a sheet asks a question before it can show the form: picking WHICH
   * category to cap happens in the same sheet as the amount, instead of a second
   * `Modal` opening on a timer while the first animates away. That handover is a
   * race whichever delay you pick, and it lost.
   */
  replaceBody?: React.ReactNode;
  /**
   * Which keyboard the sheet is built around.
   *
   * `pad` is the design's: the app's own number pad, pinned to the bottom, which
   * is what lets the layout be a fixed height. It only holds while EVERYTHING in
   * the sheet is a number.
   *
   * `system` is for sheets that also take words. A pad cannot type a name, and
   * one sitting where the name field should be is worse than no pad — so the
   * sheet sizes to its content, every field is a real input, and the whole thing
   * rides above the system keyboard instead of being covered by it.
   */
  keyboard?: 'pad' | 'system';
  /**
   * Pickers this sheet opens — `ChooseSheet`, `DatePickerSheet`.
   *
   * They have to be rendered HERE, inside this `Modal`, and not beside it. iOS
   * presents a modal from whichever view controller is already on screen, so a
   * sibling `Modal` asks the root — which is busy presenting this one — and is
   * silently dropped. Tapping a row did nothing at all, with no error.
   */
  overlays?: React.ReactNode;
  /** Once the sheet has fully left the screen. See `SheetShell`. */
  onClosed?: () => void;
  /** Under the save button: the quiet way out of an existing thing — «Borrar
   *  movimiento» — where the design keeps it, last and smallest. */
  footerExtra?: React.ReactNode;
};

/**
 * The sheet the design draws three times: `HOJA MANUAL`, `EDITAR LO DETECTADO`
 * and `CREAR` — the last of which alone serves five things (subscription,
 * account, category, goal, cap).
 *
 * Once, therefore. The shape is a claim about how money is entered in this app:
 * **the amount is the point**, so it is at the top at 46–50px with its caret, the
 * details are ordinary rows under it, and the pad is pinned to the bottom where
 * the thumb already is. Anything built later that takes a number should reach
 * for this rather than reinvent the proportions.
 *
 * The pad is the app's own rather than the system keyboard, and that is the
 * reason the layout can be fixed at all: a system keyboard is a different height
 * on every device and covers whatever it lands on, which would force the sheet
 * to scroll — and a form you scroll to reach the save button is a form, not a
 * capture.
 */
export function AmountSheet({
  visible,
  onClose,
  header,
  label,
  digits,
  onDigits,
  currency,
  sign = '',
  amountColor,
  size = 'sheet',
  symbol,
  maxDigits,
  help,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  onMic,
  replaceBody,
  keyboard = 'pad',
  overlays,
  onClosed,
  footerExtra,
}: Props) {
  const { theme } = useTheme();
  const lift = useKeyboardInset();
  const system = keyboard === 'system';

  return (
    <SheetShell
      visible={visible}
      onClose={onClose}
      top={SHEET_TOP.amount}
      fitContent={system}
      paddingBottom={system ? lift.paddingBottom : undefined}
      onLayout={lift.onLayout}
      header={header}
      overlays={overlays}
      onClosed={onClosed}
    >
      <>
        {replaceBody !== undefined ? (
          <View style={{ flex: 1 }}>{replaceBody}</View>
        ) : system ? (
          <>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              <View style={{ paddingHorizontal: 26, paddingTop: 20 }}>
                {label !== undefined ? (
                  <Text
                    variant="micro"
                    uppercase
                    color={theme.colors.textTertiary}
                    style={{ letterSpacing: 2.2, marginBottom: 9 }}
                  >
                    {label}
                  </Text>
                ) : null}
                <KeypadAmount
                  digits={digits}
                  currency={currency}
                  sign={sign}
                  size={size}
                  color={amountColor}
                  symbol={symbol}
                  onChangeDigits={onDigits}
                />
                {help !== undefined ? (
                  <Text
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 12, lineHeight: 17, marginTop: 10 }}
                  >
                    {help}
                  </Text>
                ) : null}
              </View>
              {children !== undefined ? (
                <View style={{ paddingHorizontal: 24, paddingTop: 18, gap: 10 }}>
                  {children}
                </View>
              ) : null}
            </ScrollView>
            {/* A little air over the keyboard. Flush against it, the save
                    button reads as part of the keyboard's own top row. */}
            <Footer
              primaryLabel={primaryLabel}
              onPrimary={onPrimary}
              primaryDisabled={primaryDisabled}
              onMic={onMic}
              extraBottom={lift.raised ? 18 : 0}
              extra={footerExtra}
            />
          </>
        ) : (
          <>
            <View style={{ paddingHorizontal: 26, paddingTop: 20 }}>
              {label !== undefined ? (
                <Text
                  variant="micro"
                  uppercase
                  color={theme.colors.textTertiary}
                  style={{ letterSpacing: 2.2, marginBottom: 9 }}
                >
                  {label}
                </Text>
              ) : null}
              <KeypadAmount
                digits={digits}
                currency={currency}
                sign={sign}
                size={size}
                color={amountColor}
              />
              {help !== undefined ? (
                <Text
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 12, lineHeight: 17, marginTop: 10 }}
                >
                  {help}
                </Text>
              ) : null}
            </View>

            {children !== undefined ? (
              <View style={{ paddingHorizontal: 24, paddingTop: 18, gap: 10 }}>
                {children}
              </View>
            ) : null}

            <View style={{ flex: 1 }} />

            <View style={{ paddingHorizontal: 20 }}>
              <AmountKeypad
                onKey={(key) => onDigits(pressAmountKey(digits, key, maxDigits))}
              />
            </View>

            <Footer
              primaryLabel={primaryLabel}
              onPrimary={onPrimary}
              primaryDisabled={primaryDisabled}
              onMic={onMic}
              extra={footerExtra}
            />
          </>
        )}
      </>
    </SheetShell>
  );
}

/** Save, and — only where speaking makes sense — the microphone beside it. */
function Footer({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onMic,
  extraBottom = 0,
  extra,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled: boolean;
  onMic?: () => void;
  extraBottom?: number;
  extra?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 + extraBottom }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: primaryDisabled }}
          onPress={onPrimary}
          disabled={primaryDisabled}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 18,
            // The one solid, un-tinted surface: the last thing you touch and the
            // only one that changes anything.
            backgroundColor: theme.colors.textPrimary,
            opacity: primaryDisabled ? 0.4 : pressed ? 0.9 : 1,
          })}
        >
          <Text color={theme.colors.bgBase} style={{ fontSize: 14, fontWeight: '600' }}>
            {primaryLabel}
          </Text>
        </Pressable>

        {onMic !== undefined ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('expenses.voice.mic')}
            onPress={onMic}
            style={({ pressed }) => ({
              width: 54,
              height: 54,
              borderRadius: 27,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(theme.palette.acc, 0.16),
              borderWidth: 1,
              borderColor: withAlpha(theme.palette.acc, 0.22),
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon name="microphone" size={22} stroke={1.8} color={theme.palette.acc} />
          </Pressable>
        ) : null}
      </View>
      {extra !== undefined ? <View style={{ paddingTop: 14 }}>{extra}</View> : null}
    </View>
  );
}

/**
 * One row of a sheet: label on the left, value on the right, the whole thing
 * tappable.
 *
 * Every field is this shape so nothing about which ones open a list has to be
 * learned twice — the chevron is the only difference between a row that picks
 * and a row that types.
 */
export function SheetFieldRow({
  label,
  value,
  chevron = false,
  onPress,
  children,
}: {
  label?: string;
  value?: string;
  chevron?: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
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
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {label !== undefined ? (
        <Text color={theme.colors.textTertiary} style={{ fontSize: 13.5 }}>
          {label}
        </Text>
      ) : null}
      {children ??
        (value !== undefined ? (
          <Text
            numberOfLines={1}
            style={{
              flex: label !== undefined ? 1 : 0,
              textAlign: 'right',
              fontSize: 13.5,
            }}
          >
            {value}
          </Text>
        ) : null)}
      {chevron ? (
        <Icon
          name="chevron-down"
          size={14}
          stroke={2}
          color={theme.colors.textTertiary}
        />
      ) : null}
    </Pressable>
  );
}

/**
 * The destructive action in a sheet's header — "Quitar", "Eliminar".
 *
 * `confirmLabel` makes it ask first, in place: the pill turns into the question
 * and the second tap answers it. That is for things that already exist and have
 * history hanging off them — an account with movements, a card with a debt.
 * Without it the single tap acts immediately, which is right for a draft that
 * was never saved.
 *
 * The confirmation lives in the pill rather than in a dialog because a dialog on
 * top of a sheet is a second `Modal`, and stacking those is how this app has
 * already lost one flow.
 */
export function SheetDangerAction({
  label,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const { theme } = useTheme();
  const [asking, setAsking] = useState(false);

  const armed = confirmLabel === undefined || asking;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => (armed ? onConfirm() : setAsking(true))}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: withAlpha(theme.colors.accentCoral, asking ? 0.22 : 0.12),
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name="trash" size={14} stroke={1.9} color={theme.colors.accentCoral} />
      <Text
        color={theme.colors.accentCoral}
        style={{ fontSize: 12.5, fontWeight: '500' }}
      >
        {asking ? confirmLabel : label}
      </Text>
    </Pressable>
  );
}

/**
 * The design's way to delete from inside a sheet: a coral line under the save
 * button, and — touched — a card that asks by name, «¿Borro «Almuerzo»?», with
 * the answer and the way back side by side. Nothing is lost on one tap.
 */
export function SheetDeleteConfirm({
  label,
  question,
  confirmLabel,
  cancelLabel,
  onConfirm,
  busy = false,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  busy?: boolean;
}) {
  const { theme } = useTheme();
  const [asking, setAsking] = useState(false);
  const coral = theme.colors.accentCoral;

  if (!asking) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setAsking(true)}
        style={({ pressed }) => ({
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text color={coral} style={{ fontSize: 13 }}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <RiseIn duration={200}>
      <View
        style={{
          padding: 16,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: withAlpha(coral, 0.28),
          backgroundColor: withAlpha(coral, 0.08),
        }}
      >
        <Text
          color={theme.colors.accentCoralSoft}
          style={{ fontSize: 13.5, marginBottom: 12 }}
        >
          {question}
        </Text>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            disabled={busy}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              backgroundColor: coral,
              opacity: busy ? 0.6 : pressed ? 0.85 : 1,
            })}
          >
            <Text color={theme.colors.bgBase} style={{ fontSize: 13, fontWeight: '600' }}>
              {confirmLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAsking(false)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              backgroundColor: theme.colors.bgFloat,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '500' }}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </View>
    </RiseIn>
  );
}

/** The round icon button the sheet headers open with — close, or back. */
export function SheetHeaderButton({
  icon,
  label,
  onPress,
  size = 40,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  size?: number;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bgSurface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={15} stroke={2} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

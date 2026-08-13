import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CurrencyCode } from '@/shared/domain';

import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { useTheme } from '../theme';
import { withAlpha } from '../theme/tokens';

import { AmountKeypad, pressAmountKey } from './AmountKeypad';
import { Icon } from './Icon';
import { KeypadAmount } from './KeypadAmount';
import { Scrim } from './Scrim';
import { Text } from './Text';

/** The design pins every one of these 150px from the top rather than sizing it
 *  to its content: the keypad has to land in the same place every time, whatever
 *  is being typed into it. */
const SHEET_TOP = 150;

/** The bundle's own keyframe:
 *
 *    @keyframes sheetUp { from { transform:translateY(40px); opacity:.6 }
 *                         to   { transform:translateY(0);    opacity:1  } }
 *
 * at `.26s ease`. A short rise rather than a slide from off-screen: the sheet
 * settles into a place it was nearly at already, which is what makes it read as
 * arriving rather than as being thrown. */
const RISE_PX = 40;

/**
 * Both ways, the same curve and the same time.
 *
 * Leaving used to be shorter (180ms against 260) and read as SLOWER, which is
 * the useful part: it eased IN, so at half the animation the sheet had moved
 * about 12% of the way. It looked frozen and then vanished. The clock was never
 * the problem — a curve that starts still is.
 */
const DURATION_MS = 260;

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
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const lift = useKeyboardInset();
  const system = keyboard === 'system';

  // The Modal outlives `visible` by exactly one animation, so the sheet can be
  // seen leaving instead of blinking out.
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    progress.value = withTiming(
      0,
      { duration: DURATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + progress.value * 0.4,
    transform: [{ translateY: (1 - progress.value) * RISE_PX }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      // Driven here instead: the platform's fade cannot rise, and running both
      // would be two animations disagreeing about when the sheet has arrived.
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, scrimStyle]}>
          <Scrim>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
              style={{ flex: 1 }}
            />
          </Scrim>
        </Animated.View>

        <Animated.View
          onLayout={lift.onLayout}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              // The pad's height is known, so its sheet is pinned and never moves.
              // A system keyboard is a different height on every device, so that
              // sheet sizes to its content and is lifted clear of it instead.
              ...(system
                ? { maxHeight: '94%', paddingBottom: lift.paddingBottom }
                : { top: SHEET_TOP }),
              borderTopLeftRadius: 34,
              borderTopRightRadius: 34,
              // Opaque, unlike the app's cards: a panel with its own content has to
              // cover what is behind it or neither is readable.
              backgroundColor: theme.colors.bgSheet,
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderDefault,
            },
            panelStyle,
          ]}
        >
          <SafeAreaView style={system ? undefined : { flex: 1 }} edges={['bottom']}>
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
              {header}
            </View>

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
                />
              </>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Save, and — only where speaking makes sense — the microphone beside it. */
function Footer({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onMic,
  extraBottom = 0,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled: boolean;
  onMic?: () => void;
  extraBottom?: number;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32 + extraBottom,
      }}
    >
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

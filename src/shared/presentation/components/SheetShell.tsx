import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

import { Scrim } from './Scrim';

/**
 * The sheet's motion, matched to `BottomSheet`'s — which is the one in this app
 * that feels right, and the reason is worth writing down.
 *
 * **The panel slides the whole way off the screen.** It does not fade. An
 * earlier version rose 40px and dropped to 60% opacity, taken from the bundle's
 * `sheetUp` keyframe — right for an entrance, and as an exit it meant the sheet
 * finished still visible and was then removed. That cut is what read as sticking.
 * With a full slide there is nothing left on screen to cut.
 *
 * The scrim also runs faster than the panel, both ways. The light comes back
 * before the sheet has finished leaving, which is what makes the screen behind
 * feel like it was there all along.
 */
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IN = { scrim: 220, panel: 320 };
const OUT = { scrim: 180, panel: 240 };

/** Where the design pins each panel. It sizes them by what has to fit — a list
 *  of people needs more room than an amount — rather than to their content, so
 *  that what IS shared between them lands in the same place every time. */
export const SHEET_TOP = { create: 104, amount: 150, detail: 180 } as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Distance from the top of the screen. Ignored when `fitContent`. */
  top?: number;
  /**
   * Size to the content and ride above the system keyboard, instead of filling
   * a fixed frame. For sheets that take words: a pad's height is known, a system
   * keyboard's is a different number on every device.
   */
  fitContent?: boolean;
  /** Extra bottom padding while the keyboard is up. Only with `fitContent`. */
  paddingBottom?: number;
  onLayout?: (
    event: Parameters<NonNullable<React.ComponentProps<typeof View>['onLayout']>>[0],
  ) => void;
  /** The header row, laid out horizontally under the grabber. */
  header?: React.ReactNode;
  children: React.ReactNode;
  /**
   * Pickers this sheet opens — `ChooseSheet`, `DatePickerSheet`, a nested sheet.
   *
   * They have to be rendered HERE, inside this `Modal`, and not beside it. iOS
   * presents a modal from whichever view controller is already on screen, so a
   * sibling `Modal` asks the root — which is busy presenting this one — and is
   * silently dropped. Tapping a row did nothing at all, with no error.
   */
  overlays?: React.ReactNode;
};

/**
 * The panel every sheet in this app rises in: the scrim, the slide, the rounded
 * top, the grabber and the header row.
 *
 * It exists because the design draws three sheets at three different heights —
 * `CREAR` at 104, the amount sheets at 150, `DETALLE DE DEUDA` at 180 — and the
 * only thing that actually differs between them is that number and what goes
 * inside. Everything else is the same object, including the motion, which took
 * three wrong diagnoses to get right and should never be typed a second time.
 */
export function SheetShell({
  visible,
  onClose,
  top = SHEET_TOP.amount,
  fitContent = false,
  paddingBottom,
  onLayout,
  header,
  children,
  overlays,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // The Modal outlives `visible` by exactly one animation, so the sheet can be
  // seen leaving instead of blinking out.
  const [mounted, setMounted] = useState(visible);
  const scrim = useSharedValue(0);
  const slide = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      scrim.value = withTiming(1, {
        duration: IN.scrim,
        easing: Easing.out(Easing.quad),
      });
      slide.value = withTiming(0, {
        duration: IN.panel,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    scrim.value = withTiming(0, {
      duration: OUT.scrim,
      easing: Easing.in(Easing.quad),
    });
    slide.value = withTiming(
      SCREEN_HEIGHT,
      { duration: OUT.panel, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, scrim, slide]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slide.value }],
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
          onLayout={onLayout}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              ...(fitContent ? { maxHeight: '94%', paddingBottom } : { top }),
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
          <SafeAreaView style={fitContent ? undefined : { flex: 1 }} edges={['bottom']}>
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

            {header !== undefined ? (
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
            ) : null}

            {children}
          </SafeAreaView>
        </Animated.View>

        {overlays}
      </View>
    </Modal>
  );
}

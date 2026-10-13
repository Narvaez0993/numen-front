import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** A window that lost this much height did so because of the keyboard, not
 *  because of a rotation or a font-scale reflow. */
const RESIZE_EPSILON = 40;

/**
 * How far to lift content so the keyboard does not cover it — inside a `Modal`,
 * where none of the usual answers work.
 *
 * Three things fail here, and they fail quietly:
 *
 * - `KeyboardAvoidingView` has no `behavior` on Android, because the platform is
 *   supposed to handle it via `windowSoftInputMode="adjustResize"`.
 * - That flag is set, and it does work — **for the activity's window**. A `Modal`
 *   is a separate window, and a `statusBarTranslucent` one is full-screen, which
 *   is precisely the case where Android skips `adjustResize`.
 * - `useAnimatedKeyboard` reads window insets off the activity's decor view, so
 *   inside that separate window it reports zero and nothing moves at all.
 *
 * `Keyboard`'s events do fire in both windows, so the height is knowable. What is
 * NOT knowable ahead of time is whether this particular window resized itself —
 * it depends on the modal's flags, the Android version and the OEM. Guessing
 * either way is wrong somewhere: assume it resized and the keyboard covers the
 * input; assume it did not and the content leaps a keyboard's height too far.
 *
 * So this measures instead of assuming. It remembers how tall the container is
 * with no keyboard, and compares. If the window shrank, the platform already
 * moved everything and the padding is zero; if it did not, the padding is the
 * keyboard. Right in both worlds, and it stays right on a device that behaves
 * like neither.
 */
export function useKeyboardInset() {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [resized, setResized] = useState(false);

  const keyboardRef = useRef(0);
  /** How tall the container is with no keyboard up. */
  const restHeight = useRef(0);

  useEffect(() => {
    // iOS announces the keyboard before it animates, which lets the lift ride
    // along with it. Android only says so afterwards.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, (event) => {
      keyboardRef.current = event.endCoordinates.height;
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      keyboardRef.current = 0;
      setKeyboardHeight(0);
      setResized(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (keyboardRef.current === 0) {
      restHeight.current = height;
      setResized(false);
      return;
    }
    setResized(restHeight.current > 0 && height < restHeight.current - RESIZE_EPSILON);
  }, []);

  const raised = keyboardHeight > 0 && !resized;

  return {
    onLayout,
    /** A keyboard is up AND this window did not resize itself for it — so the
     *  caller is the one holding the content clear of it. */
    raised,
    /** Spread onto the container's style. */
    paddingBottom:
      keyboardHeight === 0 || resized
        ? 0
        : // The gesture bar is under the keyboard while it is open; paying for
          // both would leave a visible gap above it.
          Math.max(keyboardHeight - insets.bottom, 0),
  };
}

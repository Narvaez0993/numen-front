import { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * How far to lift content so the keyboard does not sit on top of it — inside a
 * `Modal`, where the usual answers do not work.
 *
 * `KeyboardAvoidingView` needs a `behavior`, and Android's is `undefined`
 * because the platform is supposed to handle it: `windowSoftInputMode`
 * `adjustResize` on the activity resizes the window and everything moves up on
 * its own. That is true — for the activity. **A `Modal` is its own Android
 * window**, and a `statusBarTranslucent` one is full-screen, so nothing resizes
 * and the keyboard covers whatever was at the bottom. A text field you cannot
 * see while typing into it is the whole bug.
 *
 * `useAnimatedKeyboard` reports the real height on both platforms, modal or not,
 * and reports it on the UI thread — so the lift tracks the keyboard's own
 * animation instead of snapping after it.
 *
 * The bottom inset comes back out of it: the gesture bar is under the keyboard
 * while it is open, and paying for both would leave a visible gap.
 */
export function useKeyboardInset() {
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  return useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value - insets.bottom, 0),
  }));
}

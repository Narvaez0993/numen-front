import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  /** Sits on top of the blur, so it can hold the close affordance. */
  children?: React.ReactNode;
};

/**
 * What goes behind an overlay: the page, pushed out of focus.
 *
 * A flat tint was not enough. Home is bright text on a dark page, and dimming it
 * to 62% still left "Este es tu primer mes" and a six-figure number perfectly
 * legible behind a menu — two things asking to be read at once. Blur removes the
 * competition without hiding that the app is still there underneath.
 *
 * It lives here rather than in each overlay so the treatment is defined once:
 * a sheet and a menu should not dim the same screen two different ways.
 */
export function Scrim({ children }: Props) {
  const { theme, mode } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={40}
        tint={mode === 'dark' ? 'dark' : 'light'}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={StyleSheet.absoluteFill}
      />
      {/* The tint still carries most of the contrast — the blur only stops the
          page from being readable, it does not darken it. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.scrim }]} />
      {children}
    </View>
  );
}

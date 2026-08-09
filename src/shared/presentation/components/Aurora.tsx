import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';

type Props = ViewProps & {
  children?: ViewProps['children'];
};

/**
 * The aurora — the thing the whole design is named after.
 *
 * Three coloured blooms over a flat base, each fading to nothing rather than to
 * another colour: the palette's first tint spilling in from above the top-left
 * corner, the second from off the right edge, the third rising from below the
 * bottom. None of their centres sit on screen, which is what makes the light feel
 * like it comes from somewhere rather than from a shape drawn on the page.
 *
 * It is a component and not a style because the colour depends on both axes of
 * the theme: the tints come from the palette, the base from the mode.
 */
export function Aurora({ children, style, ...rest }: Props) {
  const { theme } = useTheme();
  const { palette, surfaces } = theme;
  const bloom = surfaces.aurora;

  return (
    <View style={[styles.root, { backgroundColor: surfaces.bgBase }, style]} {...rest}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none" opacity={0.9}>
        <Defs>
          {/* cx/cy/rx/ry are fractions of the box, matching the bundle's
              percentages: 120% 70% at 12% -8%, and so on. */}
          <RadialGradient id="au1" cx="0.12" cy="-0.08" rx="1.2" ry="0.7">
            <Stop offset="0" stopColor={palette.au1} stopOpacity={bloom.one} />
            <Stop offset="0.58" stopColor={palette.au1} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="au2" cx="1.08" cy="0.08" rx="0.9" ry="0.55">
            <Stop offset="0" stopColor={palette.au2} stopOpacity={bloom.two} />
            <Stop offset="0.6" stopColor={palette.au2} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="au3" cx="0.5" cy="1.12" rx="1.2" ry="0.6">
            <Stop offset="0" stopColor={palette.au3} stopOpacity={bloom.three} />
            <Stop offset="0.62" stopColor={palette.au3} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#au1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#au2)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#au3)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

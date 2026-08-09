import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { mixColors } from '../theme/mixColors';
import { useTheme } from '../theme/useTheme';

type Props = ViewProps & {
  children?: ViewProps['children'];
};

/**
 * The page itself: the aurora every screen sits on.
 *
 * The design paints it as one CSS declaration —
 * `radial-gradient(80% 50% at 50% 0%, color-mix(in srgb, var(--au1) 16%, base) 0%, far 62%)`
 * — a wash of the palette's first aurora tint, anchored at the top edge, fading
 * out by roughly two thirds down. React Native has no radial gradient, so it is
 * an SVG rect behind the content rather than a background colour.
 *
 * It is a component and not a style because the colour depends on both axes of
 * the theme: the tint comes from the palette, what it bleeds into comes from the
 * mode. Every screen that used `backgroundColor: theme.colors.bgBase` becomes
 * `<Aurora>` and inherits both.
 */
export function Aurora({ children, style, ...rest }: Props) {
  const { theme } = useTheme();
  const { palette, surfaces } = theme;

  // The near stop is the aurora bled into the page; the far stop is the page.
  const near = mixColors(palette.au1, surfaces.bgBase, surfaces.auroraStrength);

  return (
    <View style={[styles.root, { backgroundColor: surfaces.bgBaseFar }, style]} {...rest}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient
            id="aurora"
            cx="50%"
            cy="0%"
            rx="80%"
            ry="50%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={near} stopOpacity={1} />
            <Stop offset="62%" stopColor={surfaces.bgBaseFar} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#aurora)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

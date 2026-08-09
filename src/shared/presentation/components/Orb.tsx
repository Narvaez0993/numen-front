import { BlurView } from 'expo-blur';
import { Platform, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { mixColors } from '../theme/mixColors';
import { withAlpha } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Props = {
  size: number;
  children?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * The glass sphere the design signs itself with — the FAB, and later the
 * onboarding's breathing orb.
 *
 * The bundle builds it from one gradient plus three inset shadows:
 *
 *   background: linear-gradient(160deg, orb1 42%, orb2 34% @46%, orb3 46%)
 *   backdrop-filter: blur(14px)
 *   box-shadow: inset 0 1px 0 orb1/62%,        ← the lit top edge
 *               inset 0 0 0 1px orb1/22%,      ← the rim
 *               inset 0 -12px 22px -14px orb3  ← the mass at the bottom
 *
 * React Native has no inset shadow, so each one is drawn instead of cast: the
 * rim is a border, the top edge a hairline, and the bottom mass a second
 * gradient. Reproducing the recipe rather than approximating the result is what
 * keeps it recognisable when the palette changes underneath it.
 *
 * 160° in CSS points down and slightly right. As an SVG vector that is
 * (sin160°, −cos160°) = (0.34, 0.94), which is where the gradient coordinates
 * below come from — they are not eyeballed.
 */
export function Orb({ size, children, style }: Props) {
  const { theme, mode } = useTheme();
  const { orb1, orb2, orb3 } = theme.palette;
  const radius = size / 2;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: withAlpha(orb1, 0.22),
        },
        style,
      ]}
    >
      <BlurView
        intensity={28}
        tint={mode === 'dark' ? 'dark' : 'light'}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <Svg
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <LinearGradient id="orbBody" x1="0.28" y1="-0.10" x2="0.72" y2="1.10">
            <Stop offset="0" stopColor={orb1} stopOpacity={0.42} />
            <Stop offset="0.46" stopColor={orb2} stopOpacity={0.34} />
            <Stop offset="1" stopColor={orb3} stopOpacity={0.46} />
          </LinearGradient>
          {/* The `inset 0 -12px 22px -14px` mass, as a bottom-up fade. */}
          <LinearGradient id="orbFoot" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={orb3} stopOpacity={0.7} />
            <Stop offset="1" stopColor={orb3} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#orbBody)" />
        <Rect x="0" y="55%" width="100%" height="45%" fill="url(#orbFoot)" />
      </Svg>

      {/* The lit top edge. Inset by a quarter so it reads as a highlight on a
          sphere rather than a line across a disc. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: size * 0.25,
          right: size * 0.25,
          height: 1,
          backgroundColor: mixColors(orb1, orb2, 0.62),
          opacity: 0.62,
        }}
      />

      {children}
    </View>
  );
}

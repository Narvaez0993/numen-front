import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, RadialGradient, Stop } from 'react-native-svg';

import { Orb } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

/** The full size, and one for short screens so the welcome fits a small phone
 *  without scrolling. */
const SIZES = {
  regular: { zone: 196, orb: 116, ring: 150, halo: 240, gap: 5 },
  compact: { zone: 156, orb: 96, ring: 124, halo: 196, gap: 4 },
} as const;

/** The bundle's `ringOut`: one ring every 1.2s, each growing to twice its size
 *  and gone by the end of its 3.6s. */
const RING_MS = 3600;
const RING_GAP_MS = 1200;
/** The bundle's `orbBreath`, 3.4s for the whole breath; the halo breathes with it. */
const BREATH_MS = 1700;
const SWIRL_MS = 9000;
/** One beat of the voice bars. */
const BEAT_MS = 820;

/** The listening orb's bars, as a share of the orb, from the bundle. */
const BARS = [0.34, 0.58, 0.82, 0.54, 0.3];
/** Where in the beat each bar is, so they never move as one block. */
const BAR_PHASE = [0, 0.17, 0.34, 0.11, 0.26];

type Props = {
  /** 0 resting, 1 speaking. The demo writes it; this never re-renders for it. */
  talk: SharedValue<number>;
  /** Runs 0 → 1 once each time an example lands. 1 is «nothing to show». */
  burst: SharedValue<number>;
  compact?: boolean;
  /** Reduce Motion: the orb stands still. */
  still?: boolean;
};

/**
 * The welcome's orb, alive: the voice bars of the listening orb inside it, a
 * halo breathing around it, a slow aurora turning within, rings leaving it the
 * way sound leaves a speaker, and a flash each time a movement is «saved».
 *
 * Built so that a low-end phone only ever MOVES what is already painted:
 *
 * - Every animation runs on the UI thread (Reanimated) and touches only
 *   `transform` and `opacity` — the two things a GPU composites without
 *   redrawing.
 * - What is drawn once and then only moved — the halo, the body, the swirl,
 *   the rings — is cached as a texture (`renderToHardwareTextureAndroid`,
 *   `shouldRasterizeIOS`), so a frame is a few composited layers, not SVG.
 * - The swirl is circle-shaped content turning on its own centre, so it needs
 *   no clipping, and the body skips `Orb`'s blur: no backdrop to re-blur.
 * - The demo drives the bars and the flash through shared values. The orb is
 *   rendered once; nothing it shows depends on React state.
 */
export const WelcomeOrb = memo(function WelcomeOrb({
  talk,
  burst,
  compact = false,
  still = false,
}: Props) {
  const { theme } = useTheme();
  const size = SIZES[compact ? 'compact' : 'regular'];

  const breath = useSharedValue(1);
  const halo = useSharedValue(0);
  const swirl = useSharedValue(0);
  const beat = useSharedValue(0);
  const ring0 = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    const ease = Easing.inOut(Easing.ease);
    breath.value = withRepeat(
      withTiming(1.045, { duration: BREATH_MS, easing: ease }),
      -1,
      true,
    );
    halo.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: ease }),
      -1,
      true,
    );
    swirl.value = withRepeat(
      withTiming(1, { duration: SWIRL_MS, easing: Easing.linear }),
      -1,
    );
    beat.value = withRepeat(
      withTiming(1, { duration: BEAT_MS, easing: Easing.linear }),
      -1,
    );
    [ring0, ring1, ring2].forEach((ring, index) => {
      ring.value = withDelay(
        index * RING_GAP_MS,
        withRepeat(
          withTiming(1, { duration: RING_MS, easing: Easing.out(Easing.ease) }),
          -1,
        ),
      );
    });
  }, [still, breath, halo, swirl, beat, ring0, ring1, ring2]);

  const breathStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + 0.28 * halo.value,
    transform: [{ scale: 0.96 + 0.09 * halo.value }],
  }));
  const swirlStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swirl.value * 360}deg` }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value >= 1 ? 0 : 0.75 * (1 - burst.value),
    transform: [{ scale: 1 + 1.3 * burst.value }],
  }));

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: size.zone, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        style={[{ position: 'absolute', width: size.halo, height: size.halo }, haloStyle]}
      >
        <Svg width={size.halo} height={size.halo}>
          <Defs>
            <RadialGradient id="welcomeHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={theme.palette.orb2} stopOpacity={0.3} />
              <Stop offset="0.42" stopColor={theme.palette.orb3} stopOpacity={0.12} />
              <Stop offset="1" stopColor={theme.palette.orb3} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle
            cx={size.halo / 2}
            cy={size.halo / 2}
            r={size.halo / 2}
            fill="url(#welcomeHalo)"
          />
        </Svg>
      </Animated.View>

      {still
        ? null
        : [ring0, ring1, ring2].map((ring, index) => (
            <Ring key={index} progress={ring} size={size.ring} />
          ))}

      <Animated.View
        renderToHardwareTextureAndroid
        style={[
          {
            position: 'absolute',
            width: size.orb,
            height: size.orb,
            borderRadius: size.orb / 2,
            borderWidth: 1.5,
            borderColor: withAlpha(theme.palette.acc3, 0.75),
          },
          burstStyle,
        ]}
      />

      <Animated.View style={breathStyle}>
        <View renderToHardwareTextureAndroid shouldRasterizeIOS>
          <Orb size={size.orb} glass={false} />
        </View>
        <Animated.View
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          style={[
            { position: 'absolute', top: 0, left: 0, width: size.orb, height: size.orb },
            swirlStyle,
          ]}
        >
          <Swirl size={size.orb} />
        </Animated.View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size.orb,
            height: size.orb,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: size.gap,
          }}
        >
          {BARS.map((share, index) => (
            <Bar
              key={index}
              height={share * size.orb}
              phase={BAR_PHASE[index] ?? 0}
              bright={index === 2}
              talk={talk}
              beat={beat}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
});

function Ring({ progress, size }: { progress: SharedValue<number>; size: number }) {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value }],
  }));

  return (
    <Animated.View
      renderToHardwareTextureAndroid
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: withAlpha(theme.palette.orb2, 0.32),
        },
        style,
      ]}
    />
  );
}

/** Two soft lights inside a circle. Turning it is the whole effect: the
 *  content stays a circle at any angle, so it needs no clip while it moves. */
function Swirl({ size }: { size: number }) {
  const { theme } = useTheme();
  const r = size / 2;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id="welcomeSwirlClip">
          <Circle cx={r} cy={r} r={r - 1} />
        </ClipPath>
        <RadialGradient id="welcomeSwirlA" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.palette.au2} stopOpacity={0.42} />
          <Stop offset="1" stopColor={theme.palette.au2} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="welcomeSwirlB" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={theme.palette.orb1} stopOpacity={0.3} />
          <Stop offset="1" stopColor={theme.palette.orb1} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <G clipPath="url(#welcomeSwirlClip)">
        <Circle cx={r * 0.55} cy={r * 0.45} r={r * 0.78} fill="url(#welcomeSwirlA)" />
        <Circle cx={r * 1.5} cy={r * 1.4} r={r * 0.62} fill="url(#welcomeSwirlB)" />
      </G>
    </Svg>
  );
}

function Bar({
  height,
  phase,
  bright,
  talk,
  beat,
}: {
  height: number;
  phase: number;
  bright: boolean;
  talk: SharedValue<number>;
  beat: SharedValue<number>;
}) {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => {
    const wave = 0.5 + 0.5 * Math.sin((beat.value + phase) * 2 * Math.PI);
    // Resting, the bars barely stir; speaking, they travel their whole height.
    return { transform: [{ scaleY: 0.24 + 0.1 * wave + 0.66 * wave * talk.value }] };
  });

  return (
    <Animated.View
      style={[
        {
          width: 4,
          height,
          borderRadius: 2,
          backgroundColor: withAlpha(theme.palette.orb1, bright ? 0.95 : 0.7),
        },
        style,
      ]}
    />
  );
}

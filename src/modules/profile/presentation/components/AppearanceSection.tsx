import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/shared/presentation/components';
import {
  PALETTE_IDS,
  PALETTE_NAMES,
  palettes,
  usePalettePreference,
  useTheme,
  useThemePreference,
  type PaletteId,
  type ThemePreference,
} from '@/shared/presentation/theme';

import { GroupLabel as Label } from './GroupLabel';

const MODES: ThemePreference[] = ['auto', 'dark', 'light'];
const STRIPE_HEIGHT = 60;
const GAP = 3;
/** How much wider the chosen stripe sits. Straight from the bundle. */
const CHOSEN_WEIGHT = 2.6;

/**
 * The two axes, where the user actually meets them.
 *
 * Mode and colour are separate controls because they are separate decisions:
 * picking Jade should not disturb whether you read on paper or on black. The app
 * already composed them that way — this is the first screen that says so out loud.
 *
 * The palettes are stripes rather than dots so the choice is made by looking at
 * the colour itself at a usable size, and the chosen one widens to carry its name.
 * A row of small circles would ask the user to remember which one "Cobre" was.
 */
export function AppearanceModes() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const preference = useThemePreference((s) => s.mode);
  const setMode = useThemePreference((s) => s.setMode);

  return (
    <View>
      <Label>{t('profile.appearance.title')}</Label>
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          padding: 3,
          borderRadius: 15,
          backgroundColor: theme.colors.bgSurface,
          marginBottom: 20,
        }}
      >
        {MODES.map((option) => {
          const active = preference === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setMode(option)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: active ? theme.colors.bgElevated : 'transparent',
              }}
            >
              <Text
                color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {t(`profile.appearance.mode.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Its own block because the bundle puts it further down the screen — and because
 *  it is a separate decision from night or day. */
export function AppearancePalette() {
  const { theme, mode } = useTheme();
  const { t } = useTranslation();

  const palette = usePalettePreference((s) => s.palette);
  const setPalette = usePalettePreference((s) => s.setPalette);

  // Measured once, on mount. Every stripe paints a fill this wide and lets the
  // box clip it, which is what makes the fill independent of the animation.
  const [rowWidth, setRowWidth] = useState(0);
  const usable = Math.max(rowWidth - GAP * (PALETTE_IDS.length - 1), 0);
  const widest = (usable * CHOSEN_WEIGHT) / (CHOSEN_WEIGHT + PALETTE_IDS.length - 1);

  return (
    <View>
      <Label style={{ marginBottom: 12 }}>{t('profile.appearance.colour')}</Label>
      <View
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        style={{
          flexDirection: 'row',
          gap: GAP,
          height: STRIPE_HEIGHT,
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {PALETTE_IDS.map((id) => (
          <Stripe
            key={id}
            id={id}
            // Swatches are drawn in the mode being previewed, not a fixed one:
            // the same palette is a different colour on paper than on black.
            mode={mode}
            chosen={palette === id}
            widest={widest}
            onPress={() => setPalette(id)}
          />
        ))}
      </View>
      <Text
        color={theme.colors.textTertiary}
        style={{ fontSize: 11, lineHeight: 17.6, marginBottom: 4 }}
      >
        {t('profile.appearance.hint')}
      </Text>
    </View>
  );
}

/** The bundle's own curve and duration: `transition: flex .34s cubic-bezier(.2,.8,.2,1)`. */
const GROW = {
  duration: 340,
  easing: Easing.bezier(0.2, 0.8, 0.2, 1),
};

function Stripe({
  id,
  mode,
  chosen,
  widest,
  onPress,
}: {
  id: PaletteId;
  mode: 'light' | 'dark';
  chosen: boolean;
  /** The widest this stripe can ever be. The fill is painted at that size and
   *  clipped by the box, which is the whole trick. */
  widest: number;
  onPress: () => void;
}) {
  const swatch = palettes[mode][id];

  const weight = useSharedValue(chosen ? CHOSEN_WEIGHT : 1);
  const nameOpacity = useSharedValue(chosen ? 1 : 0);

  useEffect(() => {
    weight.value = withTiming(chosen ? CHOSEN_WEIGHT : 1, GROW);
    // The name fades faster than the stripe grows, so it is legible before the
    // box stops moving rather than arriving after it.
    nameOpacity.value = withTiming(chosen ? 1 : 0, { duration: 200 });
  }, [chosen, weight, nameOpacity]);

  const growStyle = useAnimatedStyle(() => ({ flex: weight.value }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value }));

  return (
    <Animated.View style={[{ minWidth: 0, overflow: 'hidden' }, growStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: chosen }}
        accessibilityLabel={PALETTE_NAMES[id]}
        onPress={onPress}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Fixed size, not a percentage and not measured.
         *
         * Reanimated drives `flex` on the UI thread, so React never re-renders
         * and an SVG never learns it got wider — it stayed painted at its old
         * width with bare background beside it. Painting at the widest the
         * stripe can ever be and letting the box clip it sidesteps the question:
         * there is nothing to re-measure, and the fill can never fall short. */}
        <Svg
          width={widest}
          height={STRIPE_HEIGHT}
          style={{ position: 'absolute', left: 0, top: 0 }}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={`sw-${id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={swatch.orb2} stopOpacity={chosen ? 1 : 0.4} />
              <Stop offset="1" stopColor={swatch.orb3} stopOpacity={chosen ? 1 : 0.6} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sw-${id})`} />
        </Svg>
        <Animated.View style={nameStyle} pointerEvents="none">
          <Text
            numberOfLines={1}
            color="#FFFFFF"
            style={{ fontSize: 11.5, fontWeight: '600', letterSpacing: 0.4 }}
          >
            {PALETTE_NAMES[id]}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

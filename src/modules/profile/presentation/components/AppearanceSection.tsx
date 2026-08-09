import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
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

const MODES: ThemePreference[] = ['auto', 'dark', 'light'];
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

  return (
    <View>
      <Label style={{ marginBottom: 12 }}>{t('profile.appearance.colour')}</Label>
      <View
        style={{
          flexDirection: 'row',
          gap: 3,
          height: 60,
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
  onPress,
}: {
  id: PaletteId;
  mode: 'light' | 'dark';
  chosen: boolean;
  onPress: () => void;
}) {
  const swatch = palettes[mode][id];

  // Flex is animated rather than swapped. Swapping made the stripe jump to its
  // new width in one frame, which is also what left the fill behind: the colour
  // had no chance to follow.
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
    <Animated.View style={[{ minWidth: 0 }, growStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: chosen }}
        accessibilityLabel={PALETTE_NAMES[id]}
        onPress={onPress}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {/* `width`/`height` as PROPS, not style. Given only a style, the SVG
            keeps the viewport it was first measured with, so a stripe that grows
            stays painted at its old width — the colour cut off halfway across.
            As percentage props it tracks the box it is filling. */}
        <Svg
          width="100%"
          height="100%"
          style={StyleSheet.absoluteFill}
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

function Label({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: { marginBottom?: number };
}) {
  const { theme } = useTheme();
  return (
    <Text
      variant="micro"
      uppercase
      color={theme.colors.textTertiary}
      style={{ letterSpacing: 2.2, marginBottom: 10, ...style }}
    >
      {children}
    </Text>
  );
}

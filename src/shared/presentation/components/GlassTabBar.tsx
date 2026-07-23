import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '../theme';

const BAR_HEIGHT = 62;
const ROW_PADDING = 10;
const ICON_SIZE = 22;
const PILL_WIDTH = 64;

const SWIM_SPRING = { damping: 17, stiffness: 190, mass: 0.7 };

/**
 * Bottom offset for the floating pill. Devices with a home indicator already
 * provide ~34px of safe area, so the pill hugs it; inset-less devices get a
 * small margin of their own.
 */
function barBottom(insetBottom: number): number {
  return insetBottom > 0 ? insetBottom - 6 : 10;
}

/**
 * Vertical room tab screens must reserve so content scrolls clear of the
 * floating bar (and keeps some air below the last item).
 */
export function useFloatingTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return barBottom(insets.bottom) + BAR_HEIGHT + 18;
}

/**
 * Floating "liquid glass" pill tab bar. The only place blur is allowed:
 * floating navigation surfaces, never content (design rule amended jul 2026).
 * Icons only; one single highlight pill swims between fixed tab cells (spring).
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  // Dark: tint the glass with the app's own navy so at rest it belongs to
  // the palette (the blur only reveals itself as content scrolls under).
  // Light: near-white with a hint of the page gray for cohesion.
  const glassTint =
    mode === 'dark' ? 'rgba(13, 18, 31, 0.52)' : 'rgba(250, 250, 253, 0.40)';
  const glassBorder =
    mode === 'dark' ? 'rgba(198, 210, 240, 0.07)' : 'rgba(10, 14, 26, 0.10)';
  const activePillBg =
    mode === 'dark' ? 'rgba(198, 210, 240, 0.09)' : 'rgba(10, 14, 26, 0.08)';
  // iOS system materials carry real vibrancy (saturation bleed) — the core
  // of the "liquid" look. Android falls back to plain dark/light blur.
  const blurTint =
    Platform.OS === 'ios'
      ? mode === 'dark'
        ? 'systemUltraThinMaterialDark'
        : 'systemUltraThinMaterialLight'
      : mode === 'dark'
        ? 'dark'
        : 'light';
  const sheenOpacity = mode === 'dark' ? 0.05 : 0.5;
  const rimColor =
    mode === 'dark' ? 'rgba(198, 210, 240, 0.10)' : 'rgba(255, 255, 255, 0.9)';

  const [rowWidth, setRowWidth] = useState(0);

  const pillX = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  const cellWidth = rowWidth > 0 ? (rowWidth - ROW_PADDING * 2) / state.routes.length : 0;
  const ready = rowWidth > 0;

  useEffect(() => {
    if (!ready) return;
    const cellCenter = ROW_PADDING + cellWidth * state.index + cellWidth / 2;
    const targetX = cellCenter - PILL_WIDTH / 2;
    if (pillOpacity.value === 0) {
      // First layout: place the pill without a cross-screen swim.
      pillX.value = targetX;
      pillOpacity.value = withTiming(1, { duration: 180 });
      return;
    }
    pillX.value = withSpring(targetX, SWIM_SPRING);
  }, [ready, state.index, cellWidth, pillX, pillOpacity]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    opacity: pillOpacity.value,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: barBottom(insets.bottom),
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        // Soft diffuse shadow lifts the glass off the page (light mode only,
        // matching the FAB/BottomSheet shadow rule).
        ...(mode === 'light'
          ? {
              shadowColor: '#0A0E1A',
              shadowOpacity: 0.12,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 24,
            }
          : {}),
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: BAR_HEIGHT / 2,
          borderWidth: 1,
          borderColor: glassBorder,
          overflow: 'hidden',
        }}
      >
        <BlurView
          intensity={80}
          tint={blurTint}
          experimentalBlurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: glassTint,
          }}
        />
        {/* Specular sheen: light falling on the top half of the glass. */}
        <Svg
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%' }}
        >
          <Defs>
            <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={sheenOpacity} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#sheen)" />
        </Svg>
        {/* Rim light: the bright top edge that sells the material. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 14,
            right: 14,
            height: 1,
            backgroundColor: rimColor,
          }}
        />

        {/* The swimming highlight pill (behind the tab cells). */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 9,
              bottom: 9,
              left: 0,
              width: PILL_WIDTH,
              borderRadius: (BAR_HEIGHT - 18) / 2,
              backgroundColor: activePillBg,
            },
            pillStyle,
          ]}
        />

        <View
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
            paddingHorizontal: ROW_PADDING,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] ?? {};
            const focused = state.index === index;
            const label = options?.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <GlassTab
                key={route.key}
                focused={focused}
                label={label}
                onPress={onPress}
                icon={options?.tabBarIcon?.({
                  focused,
                  color: focused ? theme.colors.accentMint : theme.colors.textTertiary,
                  size: ICON_SIZE,
                })}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function GlassTab({
  focused,
  label,
  icon,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const pressScale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.9, { duration: 90 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, SWIM_SPRING);
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={pressStyle}>{icon}</Animated.View>
    </Pressable>
  );
}

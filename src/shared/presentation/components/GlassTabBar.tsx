import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LayoutAnimation, Platform, Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

import { Text } from './Text';

const BAR_HEIGHT = 62;

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
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const glassTint =
    mode === 'dark' ? 'rgba(10, 14, 26, 0.30)' : 'rgba(255, 255, 255, 0.34)';
  const glassBorder =
    mode === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(10, 14, 26, 0.10)';
  const activePillBg =
    mode === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(10, 14, 26, 0.08)';
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
  const sheenOpacity = mode === 'dark' ? 0.09 : 0.5;
  const rimColor =
    mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.9)';

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

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key] ?? {};
            const focused = state.index === index;
            const label = options?.title ?? route.name;
            const color = focused ? theme.colors.accentMint : theme.colors.textTertiary;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                LayoutAnimation.configureNext({
                  duration: 380,
                  create: { type: 'easeInEaseOut', property: 'opacity' },
                  update: { type: 'spring', springDamping: 0.72 },
                  delete: { type: 'easeInEaseOut', property: 'opacity' },
                });
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                onPress={onPress}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: focused ? 16 : 13,
                  paddingVertical: 11,
                  borderRadius: 22,
                  backgroundColor: focused ? activePillBg : 'transparent',
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
              >
                {options?.tabBarIcon?.({ focused, color, size: 22 })}
                {focused ? (
                  <Text variant="label" color={color} style={{ fontSize: 12.5 }}>
                    {label}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LayoutAnimation, Platform, Pressable, View } from 'react-native';
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
    mode === 'dark' ? 'rgba(10, 14, 26, 0.52)' : 'rgba(255, 255, 255, 0.55)';
  const glassBorder =
    mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 14, 26, 0.10)';
  const activePillBg =
    mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(10, 14, 26, 0.08)';

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
          intensity={55}
          tint={mode === 'dark' ? 'dark' : 'light'}
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
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
                  opacity: pressed ? 0.8 : 1,
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

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { withAlpha } from '../theme/tokens';

const BAR_HEIGHT = 64;
const BAR_RADIUS = 32;
const CELL_HEIGHT = 52;
const CELL_RADIUS = 26;
const ROW_PADDING = 6;
const SIDE_INSET = 22;
const ICON_SIZE = 23;

const PRESS_SPRING = { damping: 17, stiffness: 190, mass: 0.7 };

/**
 * Bottom offset for the floating bar. Devices with a home indicator already
 * provide ~34px of safe area, so the bar hugs it; inset-less devices get a
 * margin of their own. The bundle's own `padding-bottom:22` is the latter case.
 */
function barBottom(insetBottom: number): number {
  return insetBottom > 0 ? insetBottom - 6 : 22;
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
 * The floating bar, redesigned.
 *
 * Simpler than what it replaces, deliberately. The old one carried a specular
 * sheen, a rim light and a single highlight that sprang between cells; the
 * bundle has none of that — a cell is either tinted with the accent at 15% or it
 * is nothing. So the swimming pill is gone: with `flex:1` cells the highlight
 * fills its whole cell, and something that always spans one cell has nothing to
 * swim between.
 *
 * It stays route-driven, which is what lets the fifth tab arrive later without
 * touching this file: Historia is a route that does not exist yet, and the bar
 * will render it the day it does.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: SIDE_INSET,
        right: SIDE_INSET,
        bottom: barBottom(insets.bottom),
        height: BAR_HEIGHT,
        borderRadius: BAR_RADIUS,
        ...(mode === 'light'
          ? {
              shadowColor: '#1A1626',
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
          borderRadius: BAR_RADIUS,
          borderWidth: 1,
          borderColor: theme.surfaces.borderDefault,
          backgroundColor: theme.surfaces.bgFloat,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: ROW_PADDING,
        }}
      >
        <BlurView
          intensity={26}
          tint={mode === 'dark' ? 'dark' : 'light'}
          experimentalBlurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] ?? {};
          const focused = state.index === index;

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
            <TabCell
              key={route.key}
              focused={focused}
              label={options?.title ?? route.name}
              onPress={onPress}
              activeBg={withAlpha(theme.palette.acc, 0.15)}
              icon={options?.tabBarIcon?.({
                focused,
                color: focused ? theme.palette.acc2 : theme.colors.textTertiary,
                size: ICON_SIZE,
              })}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabCell({
  focused,
  label,
  icon,
  activeBg,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  activeBg: string;
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
        pressScale.value = withSpring(1, PRESS_SPRING);
      }}
      style={{
        flex: 1,
        minHeight: CELL_HEIGHT,
        borderRadius: CELL_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? activeBg : 'transparent',
      }}
    >
      <Animated.View style={pressStyle}>{icon}</Animated.View>
    </Pressable>
  );
}

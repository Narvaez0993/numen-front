import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

const PREVIEW_HEIGHT = 152;
const SCAN_BAR_HEIGHT = 28;

type BarSpec = { width: number | string; height?: number; highlight?: boolean };

const BARS: BarSpec[] = [
  { width: '64%' },
  { width: '32%' },
  { width: '78%' },
  { width: '64%' },
  { width: '72%' },
  { width: '58%' },
  { width: '84%' },
  { width: '40%' },
];

export function ReceiptScanPreview() {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: PREVIEW_HEIGHT - SCAN_BAR_HEIGHT,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translateY]);

  return (
    <View
      style={{
        width: '76%',
        height: PREVIEW_HEIGHT,
        backgroundColor: theme.colors.bgSurface,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <FakeBar width={48} />
        <FakeBar width={28} />
      </View>
      {BARS.map((bar, i) => (
        <FakeBar key={i} width={bar.width} />
      ))}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FakeBar width={38} height={6} />
        <FakeBar width={50} height={7} highlight />
      </View>

      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: SCAN_BAR_HEIGHT,
          top: 0,
          backgroundColor: theme.colors.accentPurpleBg,
          opacity: 0.55,
          transform: [{ translateY }],
        }}
      />
    </View>
  );
}

function FakeBar({
  width,
  height = 4,
  highlight = false,
}: {
  width: number | string;
  height?: number;
  highlight?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: width as number,
        height,
        borderRadius: height / 2,
        backgroundColor: highlight ? theme.colors.accentMint : theme.colors.bgElevated,
        opacity: highlight ? 1 : 0.7,
        marginBottom: 4,
      }}
    />
  );
}

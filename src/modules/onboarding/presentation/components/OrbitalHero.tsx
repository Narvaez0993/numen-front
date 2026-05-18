import { View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

import { useTheme } from '@/shared/presentation/theme';

export function OrbitalHero() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={100}
        height={100}
        viewBox="0 0 100 100"
        style={{ position: 'absolute' }}
      >
        <Ellipse
          cx={50}
          cy={50}
          rx={48}
          ry={22}
          stroke={theme.colors.textTertiary}
          strokeOpacity={0.35}
          strokeWidth={1}
          fill="none"
        />
        <Ellipse
          cx={50}
          cy={50}
          rx={48}
          ry={22}
          stroke={theme.colors.textTertiary}
          strokeOpacity={0.25}
          strokeWidth={1}
          fill="none"
          origin="50, 50"
          rotation={60}
        />
        <Ellipse
          cx={50}
          cy={50}
          rx={48}
          ry={22}
          stroke={theme.colors.textTertiary}
          strokeOpacity={0.25}
          strokeWidth={1}
          fill="none"
          origin="50, 50"
          rotation={120}
        />
      </Svg>
      {/* "Glow" ring: solid concentric View, no shadowRadius/blur. */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: theme.colors.accentMintBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.accentMint,
          }}
        />
      </View>
    </View>
  );
}

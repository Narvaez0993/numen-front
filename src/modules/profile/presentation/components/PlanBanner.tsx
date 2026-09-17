import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  cta: string;
  onPress: () => void;
};

/**
 * The plan, where it belongs: one card that says where you stand and opens the
 * only screen that sells anything.
 *
 * It is the single tinted surface on a monochrome screen, which is the whole
 * point — an upsell that shouts from every row stops being information. What it
 * carries is a fact about the account («te quedan 12 preguntas»), not a pitch,
 * and the pitch is one tap away for whoever wants it.
 *
 * The gradient is the bundle's `linear-gradient(100deg, acc 15%, white 5%)`.
 * 100° in CSS points right and just past level: as a vector that is
 * (sin100°, −cos100°) = (0.98, 0.17), which is where the coordinates come from.
 */
export function PlanBanner({ title, subtitle, cta, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: withAlpha(theme.palette.acc, 0.22),
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Svg
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <LinearGradient id="planBanner" x1="0" y1="0" x2="0.98" y2="0.17">
            <Stop offset="0" stopColor={theme.palette.acc} stopOpacity={0.15} />
            <Stop offset="1" stopColor={theme.colors.textPrimary} stopOpacity={0.05} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#planBanner)" />
      </Svg>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13.5, fontFamily: 'Geist_500Medium' }}>{title}</Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11.5, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      <View
        style={{
          minHeight: 40,
          justifyContent: 'center',
          paddingHorizontal: 15,
          borderRadius: 14,
          backgroundColor: theme.colors.textPrimary,
        }}
      >
        <Text
          color={theme.colors.bgBase}
          style={{ fontSize: 12.5, fontFamily: 'Geist_500Medium' }}
        >
          {cta}
        </Text>
      </View>
    </Pressable>
  );
}

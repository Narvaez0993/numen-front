import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  pct: number; // 0..1.2 (over 1 shows the "over budget" overlay)
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ pct, height = 6, style }: Props) {
  const { theme } = useTheme();
  const p = Math.max(0, Math.min(1.2, pct));
  const showOver = p > 1;

  const fillColor =
    p <= 0.6
      ? theme.colors.accentMint
      : p <= 0.85
        ? theme.colors.accentAmber
        : theme.colors.accentCoral;

  return (
    <View
      style={[
        {
          width: '100%',
          height,
          borderRadius: height / 2,
          backgroundColor: theme.colors.bgElevated,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${Math.min(1, p) * 100}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: height / 2,
        }}
      />
      {showOver && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: `${(p - 1) * 100}%`,
            height: '100%',
            backgroundColor: theme.colors.accentCoral,
            opacity: 0.7,
          }}
        />
      )}
    </View>
  );
}

import { Text } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  size?: number;
};

export function Wordmark({ size = 17 }: Props) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: size,
        fontFamily: 'Geist_500Medium',
        color: theme.colors.textPrimary,
        letterSpacing: -size * 0.02,
      }}
    >
      Numen<Text style={{ color: theme.colors.accentMint }}>.</Text>
    </Text>
  );
}

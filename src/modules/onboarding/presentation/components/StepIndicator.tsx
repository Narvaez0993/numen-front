import { type ReactNode } from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
};

export function StepIndicator({ children }: Props) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        color: theme.colors.textTertiary,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        fontFamily: 'Geist_500Medium',
      }}
    >
      {children}
    </Text>
  );
}

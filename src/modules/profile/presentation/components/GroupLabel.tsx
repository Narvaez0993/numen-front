import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

/** The eyebrow over each block of Perfil: 10.5px, uppercase, tracked out to 2.2.
 *  Wider than the shared `SectionLabel` and a step quieter — the bundle uses it
 *  to separate groups on a long screen, not to title a card. */
export function GroupLabel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const { theme } = useTheme();
  return (
    <Text
      variant="micro"
      uppercase
      color={theme.colors.textTertiary}
      style={[{ letterSpacing: 2.2, marginBottom: 10 }, style]}
    >
      {children}
    </Text>
  );
}

import { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
};

export function AssistantBubble({ children }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: theme.colors.accentPurpleBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        <Icon name="sparkles" size={12} color={theme.colors.accentPurple} stroke={2} />
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          borderBottomLeftRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        {children}
      </View>
    </View>
  );
}

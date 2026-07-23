import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  text: string;
};

export function UserBubble({ text }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: theme.colors.accentMint,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 6,
          borderBottomLeftRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text
          variant="label"
          color="#0A0E1A"
          style={{ fontSize: 13.5, letterSpacing: -0.135, lineHeight: 19 }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

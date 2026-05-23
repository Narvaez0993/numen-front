import { Pressable, View } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
};

export function GhostMintButton({ label, onPress, icon }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.accentMint,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {icon ? (
          <Icon name={icon} size={14} color={theme.colors.accentMint} stroke={2} />
        ) : null}
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 13 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

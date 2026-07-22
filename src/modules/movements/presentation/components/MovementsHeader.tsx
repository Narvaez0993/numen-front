import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  monthLabel: string;
  monthTotal: number;
  initials?: string;
  onAvatarPress?: () => void;
};

export function MovementsHeader({
  monthLabel,
  monthTotal,
  initials = 'SM',
  onAvatarPress,
}: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingTop: 4,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="display"
          style={{ fontSize: 22, letterSpacing: -0.44 }}
          numberOfLines={1}
        >
          Movimientos
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 6,
            marginTop: 4,
          }}
        >
          <Text variant="caption" muted>
            {monthLabel}
          </Text>
          <Text variant="caption" muted style={{ opacity: 0.6 }}>
            ·
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            tabular
            style={{ fontWeight: '500' }}
          >
            {formatMoney(monthTotal)}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onAvatarPress}
        style={({ pressed }) => ({
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: theme.colors.accentMintBg,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 12.5 }}>
          {initials}
        </Text>
      </Pressable>
    </View>
  );
}

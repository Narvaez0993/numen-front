import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { Bank } from '../../domain';

type Props = {
  bank: Bank;
  label: string;
  active: boolean;
  onPress: () => void;
};

export function BankTile({ bank, label, active, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        aspectRatio: 1,
        backgroundColor: theme.colors.bgSurface,
        borderRadius: 14,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.colors.accentMint : theme.colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 6,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <BankAvatar bank={bank} />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10.5,
          fontFamily: 'Geist_500Medium',
          color: theme.colors.textPrimary,
          letterSpacing: -0.21,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BankAvatar({ bank }: { bank: Bank }) {
  const { theme } = useTheme();
  if (bank.kind === 'icon') {
    const tone = bank.iconColor;
    const bg =
      tone === 'neutral'
        ? 'rgba(168, 178, 200, 0.12)'
        : theme.colors[accentColorKey(tone, 'bg')];
    const fg =
      tone === 'neutral'
        ? theme.colors.textSecondary
        : theme.colors[accentColorKey(tone, 'fg')];
    return (
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={bank.icon} size={15} stroke={1.8} color={fg} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: bank.brandColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 13,
          fontFamily: 'Geist_500Medium',
          letterSpacing: -0.26,
        }}
      >
        {bank.letter}
      </Text>
    </View>
  );
}

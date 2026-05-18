import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  name: string;
  onAvatarPress?: () => void;
  hour?: number;
};

function greetingKey(hour: number): 'morning' | 'day' | 'night' {
  if (hour < 12) return 'morning';
  if (hour < 19) return 'day';
  return 'night';
}

export function HomeHeader({ name, onAvatarPress, hour }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const h = hour ?? new Date().getHours();
  const greeting = t(`home.greeting.${greetingKey(h)}`);
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingTop: 4,
      }}
    >
      <View>
        <Text variant="micro" muted uppercase style={{ marginBottom: 4 }}>
          {greeting}
        </Text>
        <Text variant="h1">{name}</Text>
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

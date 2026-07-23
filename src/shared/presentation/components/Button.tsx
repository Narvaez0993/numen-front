import { ActivityIndicator, Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  full?: boolean;
};

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  full = false,
}: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const bg = isPrimary ? theme.colors.accentMint : theme.colors.bgFloat;
  const fg = isPrimary ? theme.colors.bgBase : theme.colors.textPrimary;
  const border = isPrimary ? 'transparent' : theme.colors.borderSubtle;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderRadius: theme.radius.lg,
        paddingVertical: 13,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
        alignSelf: full ? 'stretch' : 'flex-start',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={16} color={fg} stroke={2.2} /> : null}
            <Text variant="label" color={fg}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

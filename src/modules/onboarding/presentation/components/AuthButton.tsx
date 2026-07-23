import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export type AuthButtonVariant = 'apple' | 'surface' | 'ghost';

type Props = {
  icon: string;
  iconFilled?: boolean;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant: AuthButtonVariant;
  onPress: () => void;
};

export function AuthButton({
  icon,
  iconFilled = false,
  label,
  loading = false,
  disabled = false,
  variant,
  onPress,
}: Props) {
  const { theme } = useTheme();

  const styles = (() => {
    switch (variant) {
      case 'apple':
        // Apple brand identity — white background is intentional.
        return {
          backgroundColor: '#FFFFFF',
          color: '#0A0E1A',
          borderColor: 'transparent',
        };
      case 'surface':
        return {
          backgroundColor: theme.colors.bgSurface,
          color: theme.colors.textPrimary,
          borderColor: theme.colors.borderDefault,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          color: theme.colors.textSecondary,
          borderColor: theme.colors.borderSubtle,
        };
    }
  })();

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => ({
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={styles.color} />
        ) : (
          <Icon
            name={icon}
            size={18}
            stroke={1.9}
            color={styles.color}
            filled={iconFilled}
          />
        )}
      </View>
      <Text
        style={{
          color: styles.color,
          fontFamily: 'Geist_500Medium',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

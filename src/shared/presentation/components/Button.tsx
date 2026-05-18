import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            variant === 'primary' ? theme.colors.primary : theme.colors.surface,
          borderColor: variant === 'secondary' ? theme.colors.border : 'transparent',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
        },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'primary' ? theme.colors.textInverse : theme.colors.textPrimary
            }
          />
        ) : (
          <Text
            variant="label"
            style={{
              color:
                variant === 'primary'
                  ? theme.colors.textInverse
                  : theme.colors.textPrimary,
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

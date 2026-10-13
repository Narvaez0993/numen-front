import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onBack?: () => void;
  /** Where you are: «Nos falta poquito · 1 de 3», «Entrar». */
  label?: string;
  /**
   * `plain` is the bare arrow beside a label, as on the account and setup
   * screens. `circle` is the arrow in its own glass circle, which the design
   * uses on the code screen, where there is no label to sit beside.
   */
  variant?: 'plain' | 'circle';
};

/** The row over every entry screen: the way back, and where you are. */
export function OnbTopBar({ onBack, label, variant = 'plain' }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const circle = variant === 'circle';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        paddingHorizontal: circle ? 22 : 26,
        paddingTop: 8,
      }}
    >
      {onBack !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={onBack}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            // The bare arrow sits optically on the margin, so it steps back by
            // the white space inside its own 44px target.
            marginLeft: circle ? 0 : -10,
            ...(circle
              ? {
                  backgroundColor: theme.colors.bgFloat,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                }
              : null),
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon
            name="arrow-left"
            size={17}
            stroke={2}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      ) : null}
      {label !== undefined ? (
        <Text color={theme.colors.textTertiary} style={{ flex: 1, fontSize: 11.5 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

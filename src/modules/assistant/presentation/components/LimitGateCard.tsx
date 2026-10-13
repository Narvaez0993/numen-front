import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onSeePlus: () => void;
};

/**
 * The thread is spent.
 *
 * It wears the panel the design uses for anything with an action attached — the
 * same one El Corte's play card uses — rather than an alert card with a warning
 * icon. Running out of messages is not an error: it is the plan working as
 * described, and dressing it as a problem makes the app feel broken at the exact
 * moment it is asking to be paid for.
 */
export function LimitGateCard({ onSeePlus }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 24,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 3 }}>
          {t('assistant.limit.title')}
        </Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12, lineHeight: 18 }}>
          {t('assistant.limit.body')}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSeePlus}
        style={({ pressed }) => ({
          minHeight: 44,
          justifyContent: 'center',
          paddingHorizontal: 18,
          borderRadius: 16,
          backgroundColor: theme.colors.textPrimary,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text color={theme.colors.bgBase} style={{ fontSize: 12.5, fontWeight: '600' }}>
          {t('assistant.limit.cta')}
        </Text>
      </Pressable>
    </View>
  );
}

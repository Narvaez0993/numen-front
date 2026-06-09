import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
};

export function ExpenseToggle({ value, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 14,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
      }}
    >
      <Pressable
        onPress={() => onChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        style={({ pressed }) => ({
          width: 40,
          height: 24,
          borderRadius: 100,
          backgroundColor: value ? theme.colors.accentMint : theme.colors.bgElevated,
          marginTop: 2,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 18 : 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 3,
            elevation: 2,
          }}
        />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="label" style={{ fontSize: 13, letterSpacing: -0.13 }}>
          {t('deudas.create.step2.expenseToggleTitle')}
        </Text>
        <Text
          color={theme.colors.textTertiary}
          style={{ fontSize: 11.5, lineHeight: 16.1, marginTop: 3 }}
        >
          {t('deudas.create.step2.expenseToggleSub')}
        </Text>
      </View>
    </View>
  );
}

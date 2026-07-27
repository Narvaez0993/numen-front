import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';

import { Text } from './Text';

type Props = {
  /**
   * i18n key of the message. Required, and per screen on purpose: *"No pudimos cargar
   * tus cuentas"* tells the user what failed, which a shared "algo salió mal" cannot.
   */
  titleKey: string;
  retryKey: string;
  onRetry: () => void;
};

/**
 * "Algo salió mal · Reintentar" — the state every screen that reads from the API needs.
 *
 * It exists because there were **five hand-written copies** of it (Home, Cuentas,
 * Movimientos, Categorías, Suscripciones), each ~40 identical lines differing only in two
 * i18n keys. Presupuestos was about to be the sixth and instead shipped with **no error
 * state at all**: its query failing left the screen spinning forever, which is the exact
 * failure this app decided not to have.
 *
 * The caller keeps whatever chrome it needs around this (a header, a safe area): this is
 * only the middle.
 */
export function RetryState({ titleKey, retryKey, onRetry }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
      }}
    >
      <Text variant="body" muted style={{ fontSize: 14, textAlign: 'center' }}>
        {t(titleKey)}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => ({
          paddingHorizontal: 20,
          paddingVertical: 11,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 13 }}>
          {t(retryKey)}
        </Text>
      </Pressable>
    </View>
  );
}

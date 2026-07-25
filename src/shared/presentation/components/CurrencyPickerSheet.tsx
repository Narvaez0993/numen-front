import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
  useCurrencyStore,
} from '../currency/useCurrencyStore';
import { useTheme } from '../theme';

import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Text } from './Text';

const DISPLAY_SYMBOLS: Record<CurrencyCode, string> = {
  COP: '$',
  USD: 'US$',
  EUR: '€',
  MXN: 'MX$',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Fired after the local switch so the host can persist the choice. */
  onChange?: (currency: CurrencyCode) => void;
};

/** Full currency list; the row that opens it shows the detected/selected one. */
export function CurrencyPickerSheet({ visible, onClose, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="60%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 14 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('currency.title')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('currency.subtitle')}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 14,
          }}
        >
          {SUPPORTED_CURRENCIES.map((code, i) => {
            const active = code === currency;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                onPress={() => {
                  setCurrency(code);
                  onChange?.(code);
                  onClose();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  borderBottomWidth: i === SUPPORTED_CURRENCIES.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderSubtle,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  variant="label"
                  tabular
                  color={active ? theme.colors.accentMint : theme.colors.textPrimary}
                  style={{ fontSize: 13, width: 40 }}
                >
                  {code}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  numberOfLines={1}
                  style={{ flex: 1, fontSize: 12.5 }}
                >
                  {t(`currency.names.${code}`)}
                </Text>
                <Text variant="caption" muted tabular style={{ fontSize: 12 }}>
                  {DISPLAY_SYMBOLS[code]}
                </Text>
                {active ? (
                  <Icon name="check" size={14} color={theme.colors.accentMint} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
}

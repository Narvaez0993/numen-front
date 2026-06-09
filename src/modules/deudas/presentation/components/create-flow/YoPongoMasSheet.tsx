import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

type Props = {
  visible: boolean;
  total: number;
  personsCount: number;
  onClose: () => void;
  onApply: (yoAmount: number) => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export function YoPongoMasSheet({
  visible,
  total,
  personsCount,
  onClose,
  onApply,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (visible) setVal(0);
  }, [visible]);

  const valid = val > 0 && val <= total;
  const others = personsCount;
  const perOther = others > 0 ? Math.floor((total - val) / others / 100) * 100 : 0;
  const display = formatThousands(val);

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="60%">
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 26 }}>
        <View style={{ paddingRight: 40, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 19,
              fontWeight: '500',
              letterSpacing: -0.38,
              marginBottom: 6,
            }}
          >
            {t('deudas.create.yoPongoMas.title')}
          </Text>
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.85 }}
          >
            {t('deudas.create.yoPongoMas.subtitle', { count: others })}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 4,
            paddingVertical: 8,
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.borderDefault,
          }}
        >
          <Text color={theme.colors.textSecondary} style={{ fontSize: 18 }}>
            $
          </Text>
          <TextInput
            autoFocus
            keyboardType="numeric"
            inputMode="numeric"
            value={display}
            onChangeText={(v) => {
              const raw = v.replace(/\D/g, '').slice(0, 10);
              setVal(raw === '' ? 0 : parseInt(raw, 10));
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontFamily: 'Geist_500Medium',
              letterSpacing: -0.56,
              padding: 0,
              fontVariant: ['tabular-nums'],
            }}
          />
        </View>

        {valid && others > 0 ? (
          <View
            style={{
              marginTop: 14,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 10,
            }}
          >
            <Text
              color={theme.colors.textSecondary}
              style={{ fontSize: 12, lineHeight: 17.4 }}
            >
              {t('deudas.create.yoPongoMas.perOther', {
                count: others,
                amount: formatCOP(perOther),
              })}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 18 }}>
          <Button
            full
            label={t('deudas.create.yoPongoMas.apply')}
            disabled={!valid}
            onPress={() => valid && onApply(val)}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

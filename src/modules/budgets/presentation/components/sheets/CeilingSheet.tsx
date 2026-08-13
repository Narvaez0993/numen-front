import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  Icon,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  visible: boolean;
  /** `null` when no ceiling has ever been set. */
  current: number | null;
  monthName: string;
  currency: CurrencyCode;
  saving?: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  onDelete?: () => void;
};

/**
 * The month's ceiling — the same `CREAR` sheet as a cap, because it is the same
 * act: naming a number that money is measured against.
 *
 * The help line says the thing people get wrong about it. A ceiling is standing,
 * not monthly: it keeps applying to September and October until it is changed,
 * so nobody has to remember to set it again. That is one sentence, and without
 * it the screen looks like it is asking for August only.
 *
 * No microphone. You can dictate what you spent, because it already happened;
 * a ceiling is a decision, and decisions are typed.
 */
export function CeilingSheet({
  visible,
  current,
  monthName,
  currency,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [digits, setDigits] = useState(current !== null ? String(current) : '');

  useEffect(() => {
    if (visible) setDigits(current !== null ? String(current) : '');
  }, [visible, current]);

  const amount = Number(digits || '0');

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      label={t('budgets.hero.ceiling')}
      help={t('budgets.editTecho.helper', { month: monthName })}
      primaryLabel={t('budgets.editTecho.save')}
      onPrimary={() => onSave(amount)}
      primaryDisabled={saving || amount <= 0}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('budgets.editTecho.title', { month: monthName })}
          </Text>
          {current !== null && onDelete ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDelete}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                minHeight: 40,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: withAlpha(theme.colors.accentCoral, 0.12),
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon
                name="trash"
                size={14}
                stroke={1.9}
                color={theme.colors.accentCoral}
              />
              <Text
                color={theme.colors.accentCoral}
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {t('expenses.correct.remove')}
              </Text>
            </Pressable>
          ) : null}
        </>
      }
    />
  );
}

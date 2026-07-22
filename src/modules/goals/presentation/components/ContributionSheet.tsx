import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  FieldLabel,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { Goal } from '../../domain/types/Goal';

type Props = {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (amount: number) => void;
};

const QUICK_PCTS = [0.1, 0.25, 0.5] as const;

export function ContributionSheet({ visible, goal, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  useEffect(() => {
    if (visible) setDigits('');
  }, [visible]);

  if (!goal) return null;

  const remaining = Math.max(0, goal.target - goal.saved);
  const amount = Number(digits || '0');
  const valid = amount > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="70%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('goals.contribution.title', { name: goal.name })}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('goals.contribution.remaining', { amount: formatCOP(remaining) })}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('goals.contribution.amount')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {QUICK_PCTS.map((pct) => {
            const value = Math.round(remaining * pct);
            if (value <= 0) return null;
            return (
              <Pressable
                key={pct}
                onPress={() => setDigits(String(value))}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: theme.colors.bgFloat,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text variant="label" style={{ fontSize: 12 }}>
                  {Math.round(pct * 100)}%
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={t('goals.contribution.save')}
          full
          disabled={!valid}
          onPress={() => onSave(amount)}
        />
      </View>
    </BottomSheet>
  );
}

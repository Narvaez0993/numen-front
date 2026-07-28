import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { OverpaidError } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { useAddDebtPayment } from '../../hooks/useDebtMutations';

type Props = {
  visible: boolean;
  debtId: string | null;
  onClose: () => void;
  onSaved: (amount: number) => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

/**
 * A partial repayment. It marks progress on the ledger and moves no balance — which is
 * why the account picker the prototype had is gone: there is no account to pick.
 *
 * The 100% chip settles the debt exactly; anything above what is owed comes back as
 * `debts.overpaid` from the server, and the input caps at the same bound anyway.
 */
export function RegistrarAbonoSheet({ visible, debtId, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { today, debtById, counterpartyById } = useDebtsContext();
  const deuda = debtId ? debtById[debtId] : undefined;
  const person = deuda ? counterpartyById[deuda.counterpartyId] : undefined;
  const addPayment = useAddDebtPayment(today);

  const [amount, setAmount] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setAmount(0);
      setFailed(null);
      const tm = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(tm);
    }
  }, [visible, debtId]);

  if (!deuda || !person) {
    return (
      <BottomSheet visible={visible} onClose={onClose} maxHeight="60%">
        <View />
      </BottomSheet>
    );
  }

  const isIncoming = deuda.direction === 'incoming';
  const remaining = deuda.remaining;
  const valid = amount > 0 && amount <= remaining;
  const display = formatThousands(amount);

  const CHIP_PCTS = [0.25, 0.5, 1] as const;
  const chipValues = CHIP_PCTS.map((pct) =>
    pct === 1 ? remaining : Math.round((remaining * pct) / 100) * 100,
  );

  const handleSave = () => {
    if (!valid || addPayment.isPending) return;
    setFailed(null);
    addPayment.mutate(
      { id: deuda.id, amount },
      {
        onSuccess: () => {
          onSaved(amount);
          onClose();
        },
        onError: (error) => {
          setFailed(
            error instanceof OverpaidError
              ? t('deudas.abono.overpaid')
              : t('common.error'),
          );
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 26 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingTop: 14, paddingRight: 40, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 19,
              fontWeight: '500',
              letterSpacing: -0.38,
              marginBottom: 6,
            }}
          >
            {t('deudas.abono.title')}
          </Text>
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.85 }}
          >
            {t(isIncoming ? 'deudas.abono.subIncoming' : 'deudas.abono.subOutgoing', {
              name: person.name,
            })}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            marginBottom: 18,
          }}
        >
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ marginBottom: 4, fontFamily: 'Geist_500Medium' }}
          >
            {t('deudas.abono.balanceLabel')}
          </Text>
          <Text tabular style={{ fontSize: 18, fontWeight: '500' }}>
            {formatMoney(remaining)}
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
            ref={inputRef}
            keyboardType="numeric"
            inputMode="numeric"
            value={display}
            onChangeText={(v) => {
              const raw = v.replace(/\D/g, '').slice(0, 10);
              setAmount(raw === '' ? 0 : parseInt(raw, 10));
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: 32,
              fontFamily: 'Geist_500Medium',
              letterSpacing: -0.64,
              padding: 0,
              fontVariant: ['tabular-nums'],
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 12,
          }}
        >
          {chipValues.map((val, i) => {
            const pct = CHIP_PCTS[i] ?? 0;
            const active = amount === val;
            return (
              <Pressable
                key={pct}
                onPress={() => setAmount(val)}
                style={({ pressed }) => ({
                  paddingVertical: 7,
                  paddingHorizontal: 12,
                  borderRadius: 100,
                  borderWidth: 1,
                  borderColor: active ? 'transparent' : theme.colors.borderSubtle,
                  backgroundColor: active
                    ? theme.colors.accentMintBg
                    : theme.colors.bgSurface,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  variant="label"
                  color={active ? theme.colors.accentMint : theme.colors.textSecondary}
                  style={{ fontSize: 12 }}
                >
                  <Text
                    tabular
                    color={active ? theme.colors.accentMint : theme.colors.textSecondary}
                    style={{ fontSize: 12, fontFamily: 'Geist_500Medium' }}
                  >
                    {formatMoney(val)}
                  </Text>
                  {` (${Math.round(pct * 100)}%)`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {failed ? (
          <Text
            variant="caption"
            color={theme.colors.accentCoral}
            style={{ fontSize: 11.5, marginTop: 12 }}
          >
            {failed}
          </Text>
        ) : null}

        <View style={{ marginTop: 22 }}>
          <Button
            full
            label={t('deudas.abono.save')}
            disabled={!valid || addPayment.isPending}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { BottomSheet, Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { ACCOUNT_OPTIONS, type SelectOption } from '../../constants/options';
import {
  selectCounterparty,
  selectDeuda,
  useDeudasStore,
} from '../../stores/useDeudasStore';

import { SelectListSheet } from './SelectListSheet';

type Props = {
  visible: boolean;
  debtId: string | null;
  onClose: () => void;
  onSaved: (amount: number) => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export function RegistrarAbonoSheet({ visible, debtId, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const deuda = useDeudasStore((s) => (debtId ? selectDeuda(s, debtId) : undefined));
  const person = useDeudasStore((s) =>
    deuda ? selectCounterparty(s, deuda.counterpartyId) : undefined,
  );
  const today = useDeudasStore((s) => s.today);
  const registerPayment = useDeudasStore((s) => s.registerPayment);

  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState('BBVA Débito');
  const [acctSheetOpen, setAcctSheetOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setAmount(0);
      setAccount('BBVA Débito');
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
  const balance = deuda.balance;
  const valid = amount > 0 && amount <= balance;
  const display = formatThousands(amount);

  const CHIP_PCTS = [0.25, 0.5, 1] as const;
  const chipValues = CHIP_PCTS.map((pct) =>
    pct === 1 ? balance : Math.round((balance * pct) / 100) * 100,
  );

  const handleSave = () => {
    if (!valid) return;
    registerPayment(deuda.id, {
      amount,
      account,
      date: today,
    });
    onSaved(amount);
    onClose();
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
            {formatCOP(balance)}
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
                    {formatCOP(val)}
                  </Text>
                  {` (${Math.round(pct * 100)}%)`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ marginBottom: 8, fontFamily: 'Geist_500Medium' }}
          >
            {t(
              isIncoming
                ? 'deudas.abono.accountIncoming'
                : 'deudas.abono.accountOutgoing',
            )}
          </Text>
          <Pressable
            onPress={() => setAcctSheetOpen(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: theme.colors.accentMintBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="building-bank" size={14} color={theme.colors.accentMint} />
              </View>
              <Text style={{ fontSize: 13.5, fontWeight: '500' }} numberOfLines={1}>
                {account}
              </Text>
            </View>
            <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: 'rgba(168,178,200,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="calendar-event"
              size={14}
              stroke={1.9}
              color={theme.colors.textSecondary}
            />
          </View>
          <Text style={{ flex: 1, fontSize: 13 }}>
            {i18n.language.startsWith('en') ? 'Today · 14 May' : 'Hoy · 14 may'}
          </Text>
          <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
        </View>

        <View style={{ marginTop: 22 }}>
          <Button
            full
            label={t('deudas.abono.save')}
            disabled={!valid}
            onPress={handleSave}
          />
        </View>
      </ScrollView>

      <SelectListSheet<string>
        visible={acctSheetOpen}
        title={t('deudas.create.step2.accountSheetTitle')}
        options={ACCOUNT_OPTIONS}
        value={account}
        onSelect={(opt: SelectOption<string>) => {
          setAccount(opt.value);
          setAcctSheetOpen(false);
        }}
        onClose={() => setAcctSheetOpen(false)}
      />
    </BottomSheet>
  );
}

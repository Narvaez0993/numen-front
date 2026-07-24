import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CurrencyPickerSheet, Icon, Text } from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';

import { BANKS, type BankId } from '../../domain';

import { BankTile } from '../components/BankTile';
import { OnbCTA } from '../components/OnbCTA';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { SegmentProgress } from '../components/SegmentProgress';
import { SetupBalanceSheet } from '../components/SetupBalanceSheet';
import { StepIndicator } from '../components/StepIndicator';
import { parseBalanceDigits } from '../utils/formatBalanceInput';

type Props = {
  initialBankId: BankId | null;
  initialSourceName: string | null;
  initialBalance: number;
  onBack: () => void;
  onContinue: (params: {
    bankId: BankId | null;
    sourceName: string | null;
    balance: number;
  }) => void;
};

export function SetupScreen({
  initialBankId,
  initialSourceName,
  initialBalance,
  onBack,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<BankId | null>(initialBankId);
  const [sourceName, setSourceName] = useState(initialSourceName ?? '');
  const [showSheet, setShowSheet] = useState(false);
  const [balance, setBalance] = useState(initialBalance ? initialBalance.toString() : '');
  const currency = useCurrencyStore((s) => s.currency);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const onTileClick = (id: BankId) => {
    if (id !== selected) {
      setSourceName(t(`onboarding.setup.banks.${id}`));
    }
    setSelected(id);
    setShowSheet(true);
  };

  const resolvedName = (id: BankId | null) => {
    const trimmed = sourceName.trim();
    if (trimmed) return trimmed;
    return id ? t(`onboarding.setup.banks.${id}`) : null;
  };

  const saveBalance = () => {
    const num = parseBalanceDigits(balance);
    setShowSheet(false);
    onContinue({ bankId: selected, sourceName: resolvedName(selected), balance: num });
  };

  const selectedBank = BANKS.find((b) => b.id === selected) ?? null;

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={24}>
      <OnbHeader
        onBack={onBack}
        center={<StepIndicator>{t('onboarding.perso.step3')}</StepIndicator>}
      />
      <View style={{ marginTop: 14 }}>
        <SegmentProgress total={3} current={2} />
      </View>

      <View style={{ height: 28 }} />

      <Text
        style={{
          fontSize: 24,
          fontFamily: 'Geist_500Medium',
          color: theme.colors.textPrimary,
          letterSpacing: -0.48,
          marginBottom: 8,
        }}
      >
        {t('onboarding.setup.title')}
      </Text>
      <Text variant="body" muted style={{ fontSize: 13, lineHeight: 19 }}>
        {t('onboarding.setup.subtitle')}
      </Text>

      <View style={{ height: 22 }} />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {BANKS.map((bank) => (
          <View key={bank.id} style={{ width: '23.5%' }}>
            <BankTile
              bank={bank}
              label={t(`onboarding.setup.banks.${bank.id}`)}
              active={selected === bank.id}
              onPress={() => onTileClick(bank.id)}
            />
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setCurrencyOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 16,
          paddingHorizontal: 14,
          paddingVertical: 13,
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 12,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text variant="caption" muted>
          {t('onboarding.setup.currency')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="label" style={{ fontSize: 12.5 }}>
            {currency} · {t(`currency.names.${currency}`)}
          </Text>
          <Icon name="chevron-right" size={13} color={theme.colors.textTertiary} />
        </View>
      </Pressable>

      <View style={{ flex: 1 }} />

      <OnbCTA
        disabled={!selected}
        onPress={() =>
          onContinue({
            bankId: selected,
            sourceName: resolvedName(selected),
            balance: parseBalanceDigits(balance),
          })
        }
      >
        {t('onboarding.perso.continue')}
      </OnbCTA>
      <OnbTextLink
        onPress={() => onContinue({ bankId: null, sourceName: null, balance: 0 })}
        style={{ marginTop: 4 }}
      >
        {t('onboarding.perso.skip')}
      </OnbTextLink>

      <CurrencyPickerSheet
        visible={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
      />

      {selectedBank && (
        <SetupBalanceSheet
          visible={showSheet}
          name={sourceName}
          onNameChange={setSourceName}
          value={balance}
          onChange={setBalance}
          onSave={saveBalance}
          onSkip={() => {
            setShowSheet(false);
            onContinue({
              bankId: selected,
              sourceName: resolvedName(selected),
              balance: 0,
            });
          }}
          onClose={() => setShowSheet(false)}
          title={t(`onboarding.setup.sheetTitles.${selectedBank.id}`)}
          hint={t('onboarding.setup.sheet.hint')}
          nameLabel={t('onboarding.setup.sheet.nameLabel')}
          namePlaceholder={t('onboarding.setup.sheet.namePlaceholder')}
          balanceLabel={t('onboarding.setup.sheet.balanceLabel')}
          saveLabel={t('onboarding.setup.sheet.save')}
          skipLabel={t('onboarding.setup.sheet.skip')}
        />
      )}
    </OnbPage>
  );
}

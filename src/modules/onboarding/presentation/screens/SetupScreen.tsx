import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { BANKS, type BankId } from '../../domain';

import { BankTile } from '../components/BankTile';
import { OnbCTA } from '../components/OnbCTA';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { SetupBalanceSheet } from '../components/SetupBalanceSheet';
import { parseBalanceDigits } from '../utils/formatBalanceInput';

type Props = {
  initialBankId: BankId | null;
  initialBalance: number;
  onBack: () => void;
  onContinue: (params: { bankId: BankId | null; balance: number }) => void;
};

export function SetupScreen({
  initialBankId,
  initialBalance,
  onBack,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState<BankId | null>(initialBankId);
  const [showSheet, setShowSheet] = useState(false);
  const [balance, setBalance] = useState(initialBalance ? initialBalance.toString() : '');

  const onTileClick = (id: BankId) => {
    setSelected(id);
    setShowSheet(true);
  };

  const saveBalance = () => {
    const num = parseBalanceDigits(balance);
    setShowSheet(false);
    onContinue({ bankId: selected, balance: num });
  };

  const selectedBank = BANKS.find((b) => b.id === selected) ?? null;

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={24}>
      <OnbHeader onBack={onBack} />

      <View style={{ height: 14 }} />

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

      <View style={{ flex: 1 }} />

      <OnbCTA
        disabled={!selected}
        onPress={() =>
          onContinue({
            bankId: selected,
            balance: parseBalanceDigits(balance),
          })
        }
      >
        {t('onboarding.perso.continue')}
      </OnbCTA>
      <OnbTextLink
        onPress={() => onContinue({ bankId: null, balance: 0 })}
        style={{ marginTop: 4 }}
      >
        {t('onboarding.perso.skip')}
      </OnbTextLink>

      {selectedBank && (
        <SetupBalanceSheet
          visible={showSheet}
          bankName={t(`onboarding.setup.banks.${selectedBank.id}`)}
          value={balance}
          onChange={setBalance}
          onSave={saveBalance}
          onSkip={() => {
            setShowSheet(false);
            onContinue({ bankId: selected, balance: 0 });
          }}
          onClose={() => setShowSheet(false)}
          title={t('onboarding.setup.sheet.title')}
          hint={t('onboarding.setup.sheet.hint')}
          saveLabel={t('onboarding.setup.sheet.save')}
          skipLabel={t('onboarding.setup.sheet.skip')}
        />
      )}
    </OnbPage>
  );
}

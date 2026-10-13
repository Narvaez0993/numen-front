import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  SHEET_TOP,
  SheetHeaderButton,
  SheetShell,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { initialOf } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { debtAccent, debtAccentSoft } from '../../utils/debtAccent';

type Props = {
  visible: boolean;
  currency: CurrencyCode;
  onClose: () => void;
};

/**
 * The shelf of closed debts.
 *
 * Collected and given up sit together, because both are the same zero from the
 * list's point of view — there is nothing left to do about either. What tells
 * them apart is one word on the right, and it matters: calling a written-off
 * debt "pagado" would say a friend paid you back when nobody did.
 */
export function HistorySheet({ visible, currency, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { snapshot, counterpartyById } = useDebtsContext();

  const closed = snapshot.debts.filter(
    (debt) => debt.status === 'paid' || debt.status === 'written_off',
  );

  return (
    <SheetShell
      visible={visible}
      onClose={onClose}
      top={SHEET_TOP.detail}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('deudas.history.title')}
          </Text>
        </>
      }
    >
      <Text
        color={theme.colors.textTertiary}
        style={{ paddingHorizontal: 26, paddingTop: 16, fontSize: 12.5, lineHeight: 19 }}
      >
        {t('deudas.history.subtitle')}
      </Text>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 26,
          paddingTop: 18,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {closed.length === 0 ? (
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5, paddingVertical: 20 }}
          >
            {t('deudas.history.empty')}
          </Text>
        ) : (
          closed.map((debt, index) => {
            const person = counterpartyById[debt.counterpartyId];
            const lost = debt.status === 'written_off';
            return (
              <View
                key={debt.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 44,
                  paddingVertical: 12,
                  borderBottomWidth: index === closed.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderSubtle,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: withAlpha(debtAccent(theme), lost ? 0.06 : 0.14),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    color={lost ? theme.colors.textTertiary : debtAccentSoft(theme)}
                    style={{ fontSize: 13, fontWeight: '600' }}
                  >
                    {initialOf(person?.name ?? '?')}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14 }}>
                    {person?.name ?? '—'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 11, marginTop: 2 }}
                  >
                    {debt.note?.trim() || t('deudas.history.noNote')}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    tabular
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 13.5 }}
                  >
                    {formatMoney(debt.amount, currency)}
                  </Text>
                  <Text
                    variant="micro"
                    uppercase
                    color={lost ? theme.colors.accentCoral : theme.colors.textTertiary}
                    style={{ fontSize: 9.5, letterSpacing: 1.4, marginTop: 3 }}
                  >
                    {t(`deudas.status.${debt.status}`)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SheetShell>
  );
}

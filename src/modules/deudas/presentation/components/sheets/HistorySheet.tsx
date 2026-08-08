import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BottomSheet, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { useDebtsContext } from '../../context/DebtsContext';
import { DebtPill } from '../DebtPill';
import { PersonAvatar } from '../PersonAvatar';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HistorySheet({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { snapshot, counterpartyById } = useDebtsContext();

  // Closed either way: collected or given up. They are the same shelf and the pill
  // is what tells them apart — one was paid, the other was lost.
  const paid = snapshot.debts.filter(
    (d) => d.status === 'paid' || d.status === 'written_off',
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="70%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 14 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('deudas.history.title')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('deudas.history.subtitle')}
          </Text>
        </View>

        {paid.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 22 }}>
            <Text variant="caption" muted>
              {t('deudas.history.empty')}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderColor: theme.colors.borderSubtle,
              borderWidth: 1,
              borderRadius: 14,
            }}
          >
            {paid.map((debt, i) => {
              const person = counterpartyById[debt.counterpartyId];
              return (
                <View
                  key={debt.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderBottomWidth: i === paid.length - 1 ? 0 : 1,
                    borderBottomColor: theme.colors.borderSubtle,
                  }}
                >
                  {person ? <PersonAvatar person={person} size={32} /> : null}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      variant="bodyLarge"
                      numberOfLines={1}
                      style={{ fontSize: 13.5 }}
                    >
                      {person?.name ?? '—'}
                    </Text>
                    <Text variant="caption" muted style={{ marginTop: 2, fontSize: 11 }}>
                      {debt.note ?? t('deudas.history.noNote')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text variant="bodyLarge" tabular style={{ fontSize: 13.5 }}>
                      {formatMoney(debt.amount)}
                    </Text>
                    <DebtPill status={debt.status} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

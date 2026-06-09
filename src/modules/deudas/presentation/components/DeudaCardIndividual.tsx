import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { type Deuda, debtProgress, debtStatus } from '../../domain/types/Deuda';
import { selectCounterparty, useDeudasStore } from '../stores/useDeudasStore';
import { useDueLabel } from '../utils/useDueLabel';

import { DebtPill } from './DebtPill';
import { PersonAvatar } from './PersonAvatar';

type Props = {
  deuda: Deuda;
  onPress: () => void;
};

export function DeudaCardIndividual({ deuda, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const person = useDeudasStore((s) => selectCounterparty(s, deuda.counterpartyId));
  const dueLabel = useDueLabel(deuda, today);

  if (!person) return null;

  const status = debtStatus(deuda, today);
  const pct = debtProgress(deuda);
  const sub = `${t('deudas.card.loanShort')} · ${dueLabel}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 16,
        padding: 14,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <PersonAvatar person={person} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14.5, fontWeight: '500', letterSpacing: -0.145 }}
          >
            {person.name}
          </Text>
          <Text
            color={theme.colors.textTertiary}
            numberOfLines={1}
            style={{ fontSize: 11.5, marginTop: 2 }}
          >
            {sub}
          </Text>
        </View>
        <Text tabular style={{ fontSize: 15, fontWeight: '500', letterSpacing: -0.15 }}>
          {formatCOP(deuda.balance)}
        </Text>
      </View>

      <ProgressBar pct={pct} height={5} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
          {t('deudas.pctPaid', { pct: Math.round(pct * 100) })}
        </Text>
        <DebtPill status={status} />
      </View>
    </Pressable>
  );
}

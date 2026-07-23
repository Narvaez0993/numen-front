import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { type Deuda, debtStatus, type SharedEvent } from '../../domain/types/Deuda';
import { useDeudasStore } from '../stores/useDeudasStore';

import { DebtPill } from './DebtPill';
import { PersonAvatar } from './PersonAvatar';

type Props = {
  event: SharedEvent;
  debts: Deuda[];
  expanded: boolean;
  onToggle: () => void;
  onPersonPress: (d: Deuda) => void;
  onBulk?: () => void;
};

export function DeudaCardShared({
  event,
  debts,
  expanded,
  onToggle,
  onPersonPress,
  onBulk,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const counterparties = useDeudasStore((s) => s.counterparties);

  const totalPaid = debts.reduce((s, d) => s + (d.amount - d.balance), 0);
  const totalRem = debts.reduce((s, d) => s + d.balance, 0);
  const pendingCount = debts.filter((d) => debtStatus(d, today) !== 'paid').length;
  const pct = event.totalAmount > 0 ? totalPaid / event.totalAmount : 0;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({ padding: 14, opacity: pressed ? 0.92 : 1 })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <IconBox
            name={event.icon}
            color={event.iconColor}
            size={40}
            iconSize={19}
            radius={12}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 14.5, fontWeight: '500', letterSpacing: -0.145 }}
            >
              {event.name}
            </Text>
            <Text
              color={theme.colors.textTertiary}
              numberOfLines={1}
              style={{ fontSize: 11.5, marginTop: 2 }}
            >
              {t('deudas.card.sharedWith', { count: debts.length })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text
              tabular
              style={{ fontSize: 15, fontWeight: '500', letterSpacing: -0.15 }}
            >
              {formatMoney(event.totalAmount)}
            </Text>
            <View
              style={{
                transform: [{ rotate: expanded ? '180deg' : '0deg' }],
              }}
            >
              <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
            </View>
          </View>
        </View>

        <ProgressBar pct={pct} height={5} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            gap: 6,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}
          >
            <Text
              tabular
              color={theme.colors.accentMint}
              style={{ fontSize: 11, fontFamily: 'Geist_500Medium' }}
            >
              {formatMoney(totalPaid)}
            </Text>
            <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
              {' '}
              {t('deudas.card.collected')}
              {' · '}
            </Text>
            <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
              {t('deudas.card.pending', { count: pendingCount })}
            </Text>
          </View>
          <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
            {t('deudas.card.remaining', { amount: formatMoney(totalRem) })}
          </Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderSubtle,
              paddingTop: 12,
              gap: 9,
            }}
          >
            {debts.map((d) => {
              const p = counterparties.find((c) => c.id === d.counterpartyId);
              if (!p) return null;
              const s = debtStatus(d, today);
              const isPartial = s === 'partial';
              return (
                <Pressable
                  key={d.id}
                  onPress={() => onPersonPress(d)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 6,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <PersonAvatar person={p} size={26} fontSize={11} />
                  <Text style={{ flex: 1, fontSize: 13 }} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text
                    tabular
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 12 }}
                  >
                    {isPartial
                      ? `${formatMoney(d.amount - d.balance)} / ${formatMoney(d.amount)}`
                      : formatMoney(d.amount)}
                  </Text>
                  <DebtPill status={s} />
                </Pressable>
              );
            })}
          </View>

          {pendingCount > 0 && onBulk ? (
            <Pressable
              onPress={onBulk}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 12,
                paddingVertical: 9,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: theme.colors.borderDefault,
                borderRadius: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Icon
                name="checks"
                size={13}
                stroke={2}
                color={theme.colors.textSecondary}
              />
              <Text
                variant="label"
                color={theme.colors.textSecondary}
                style={{ fontSize: 12 }}
              >
                {t('deudas.card.bulkMarkPaid')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { debtProgress, debtStatus } from '../../domain/types/Deuda';
import {
  selectCounterparty,
  selectDeuda,
  selectEvent,
  useDeudasStore,
} from '../stores/useDeudasStore';
import { formatShortDate } from '../utils/formatShortDate';
import { useDueLabel } from '../utils/useDueLabel';

import { DebtPill } from './DebtPill';
import { PersonAvatar } from './PersonAvatar';

type Props = {
  debtId: string;
  onBack: () => void;
  onAbono: () => void;
};

export function DeudaDetail({ debtId, onBack, onAbono }: Props) {
  const { theme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const deuda = useDeudasStore((s) => selectDeuda(s, debtId));
  const person = useDeudasStore((s) =>
    deuda ? selectCounterparty(s, deuda.counterpartyId) : undefined,
  );
  const event = useDeudasStore((s) =>
    deuda?.eventId ? selectEvent(s, deuda.eventId) : undefined,
  );
  const dueLabel = useDueLabel(deuda ?? ({ dueDate: null } as never), today);

  if (!deuda || !person) return null;

  const status = debtStatus(deuda, today);
  const pct = debtProgress(deuda);
  const isIncoming = deuda.direction === 'incoming';
  const isOverdue = status === 'overdue';

  const sub = event
    ? t('deudas.detail.partOf', { event: event.name })
    : `${t(isIncoming ? 'deudas.detail.subTheyOweYou' : 'deudas.detail.subYouOweThem')} · ${dueLabel}`;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={onBack}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon
            name="arrow-left"
            size={17}
            stroke={1.9}
            color={theme.colors.textSecondary}
          />
        </Pressable>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="dots" size={17} color={theme.colors.textSecondary} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={{
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingBottom: 22,
          }}
        >
          <PersonAvatar person={person} size={64} fontSize={22} />
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '500',
                letterSpacing: -0.44,
              }}
            >
              {person.name}
            </Text>
            <Text
              color={theme.colors.textSecondary}
              style={{ fontSize: 12.5, marginTop: 4, textAlign: 'center' }}
            >
              {sub}
            </Text>
          </View>
        </View>

        {/* Overdue alert */}
        {isOverdue && deuda.dueDate ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'flex-start',
              backgroundColor: theme.colors.accentCoralBg,
              borderWidth: 1,
              borderColor:
                mode === 'dark' ? 'rgba(255,107,71,0.2)' : 'rgba(224,77,36,0.2)',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 12,
            }}
          >
            <View style={{ marginTop: 1 }}>
              <Icon
                name="alert-triangle"
                size={15}
                stroke={1.9}
                color={theme.colors.accentCoral}
              />
            </View>
            <Text
              color={theme.colors.textSecondary}
              style={{ flex: 1, fontSize: 12, lineHeight: 17.4 }}
            >
              {t('deudas.detail.overdueAlert', {
                date: formatShortDate(deuda.dueDate, i18n.language),
                name: person.name,
              })}
            </Text>
          </View>
        ) : null}

        {/* Balance card */}
        <Card padding={18} radius={18}>
          <Text
            variant="micro"
            color={theme.colors.textTertiary}
            uppercase
            style={{ marginBottom: 6, fontFamily: 'Geist_500Medium' }}
          >
            {t('deudas.detail.balancePending')}
          </Text>
          <Text
            tabular
            style={{
              fontSize: 32,
              fontWeight: '500',
              letterSpacing: -0.64,
              lineHeight: 32,
            }}
          >
            {formatCOP(deuda.balance)}
          </Text>
          <Text color={theme.colors.textSecondary} style={{ fontSize: 12, marginTop: 6 }}>
            {t('deudas.detail.ofOriginal', { amount: formatCOP(deuda.amount) })}
          </Text>
          <View style={{ marginTop: 14 }}>
            <ProgressBar pct={pct} height={6} />
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
          </View>
        </Card>

        {status !== 'paid' ? (
          <View style={{ marginTop: 14 }}>
            <Button full label={t('deudas.detail.registerAbono')} onPress={onAbono} />
          </View>
        ) : null}

        {/* Historial */}
        <View style={{ marginTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            muted
            style={{ paddingHorizontal: 4, paddingBottom: 8 }}
          >
            {t('deudas.history.title')}
          </Text>
          {deuda.payments.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.bgSurface,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: theme.colors.borderSubtle,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 24,
              }}
            >
              <Text
                color={theme.colors.textTertiary}
                style={{ fontSize: 12.5, textAlign: 'center' }}
              >
                {t('deudas.history.empty')}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {[...deuda.payments].reverse().map((p, i) => (
                <View
                  key={`${p.date}-${i}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: theme.colors.bgSurface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSubtle,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      backgroundColor: isIncoming
                        ? theme.colors.accentMintBg
                        : theme.colors.accentAmberBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name={isIncoming ? 'arrow-down-left' : 'arrow-up-right'}
                      size={16}
                      stroke={2}
                      color={
                        isIncoming ? theme.colors.accentMint : theme.colors.accentAmber
                      }
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text tabular style={{ fontSize: 14.5, fontWeight: '500' }}>
                      {formatCOP(p.amount)}
                    </Text>
                    <Text
                      color={theme.colors.textTertiary}
                      numberOfLines={1}
                      style={{ fontSize: 11.5, marginTop: 2 }}
                    >
                      {formatShortDate(p.date, i18n.language)} · {p.account}
                      {p.note ? ` · ${p.note}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

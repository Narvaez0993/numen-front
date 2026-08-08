import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Share, View } from 'react-native';

import { Button, Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { debtProgress, type Deuda } from '../../domain';
import { useDebtsContext } from '../context/DebtsContext';
import { formatShortDate } from '../utils/formatShortDate';
import { useDueLabel } from '../utils/useDueLabel';

import { DebtPill } from './DebtPill';
import { PersonAvatar } from './PersonAvatar';

type Props = {
  debtId: string;
  onBack: () => void;
  onAbono: () => void;
  onDelete: () => void;
  onWriteOff: () => void;
  onReopen: () => void;
};

export function DeudaDetail({
  debtId,
  onBack,
  onAbono,
  onDelete,
  onWriteOff,
  onReopen,
}: Props) {
  const { theme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { today, debtById, counterpartyById, eventById } = useDebtsContext();
  const deuda = debtById[debtId];
  const person = deuda ? counterpartyById[deuda.counterpartyId] : undefined;
  const event = deuda?.eventId ? eventById[deuda.eventId] : undefined;
  const dueLabel = useDueLabel(deuda ?? ({ dueOn: null } as Deuda), today);

  if (!deuda || !person) return null;

  const status = deuda.status;
  const pct = debtProgress(deuda);
  const isIncoming = deuda.direction === 'incoming';
  const isOverdue = status === 'overdue';
  const givenUp = status === 'written_off';

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('deudas.share.button')}
          onPress={() => {
            const key = isIncoming
              ? 'deudas.share.messageIncoming'
              : 'deudas.share.messageOutgoing';
            const parts = [
              t(key, {
                name: person.name,
                balance: formatMoney(deuda.remaining),
                total: formatMoney(deuda.amount),
                pct: Math.round(debtProgress(deuda) * 100),
              }),
            ];
            if (event) parts.push(t('deudas.share.ofEvent', { event: event.name }));
            if (deuda.dueOn) {
              parts.push(
                t('deudas.share.dueOn', {
                  date: formatShortDate(deuda.dueOn, i18n.language),
                }),
              );
            }
            void Share.share({ message: parts.join(' · ') }).catch(() => undefined);
          }}
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
          <Icon name="arrow-up-right" size={17} color={theme.colors.textSecondary} />
        </Pressable>
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

        {/* Written off: the money is gone and the calendar stopped mattering. */}
        {givenUp && deuda.writtenOffOn ? (
          <View
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 12,
            }}
          >
            <Text
              color={theme.colors.textSecondary}
              style={{ fontSize: 12, lineHeight: 17.4 }}
            >
              {t('deudas.writeOff.banner', {
                date: formatShortDate(deuda.writtenOffOn, i18n.language),
              })}
            </Text>
          </View>
        ) : null}

        {/* Overdue alert */}
        {isOverdue && deuda.dueOn ? (
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
                date: formatShortDate(deuda.dueOn, i18n.language),
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
            {formatMoney(deuda.remaining)}
          </Text>
          <Text color={theme.colors.textSecondary} style={{ fontSize: 12, marginTop: 6 }}>
            {t('deudas.detail.ofOriginal', { amount: formatMoney(deuda.amount) })}
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

        {givenUp ? (
          <View style={{ marginTop: 14 }}>
            <Button
              full
              variant="secondary"
              label={t('deudas.writeOff.reopen')}
              onPress={onReopen}
            />
          </View>
        ) : status !== 'paid' ? (
          <View style={{ marginTop: 14, gap: 10 }}>
            <Button full label={t('deudas.detail.registerAbono')} onPress={onAbono} />
            {/* Only for money owed TO the user: being forgiven what you owe is a
                windfall, not a loss, and the ledger refuses it outright. */}
            {isIncoming ? (
              <Pressable
                onPress={onWriteOff}
                style={({ pressed }) => ({
                  width: '100%',
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  variant="label"
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 12.5 }}
                >
                  {t('deudas.writeOff.action')}
                </Text>
              </Pressable>
            ) : null}
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
              {[...deuda.payments].reverse().map((p) => (
                <View
                  key={p.id}
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
                      {formatMoney(p.amount)}
                    </Text>
                    <Text
                      color={theme.colors.textTertiary}
                      numberOfLines={1}
                      style={{ fontSize: 11.5, marginTop: 2 }}
                    >
                      {formatShortDate(p.paidOn, i18n.language)}
                      {p.note ? ` · ${p.note}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 18,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.accentCoral}
            style={{ fontSize: 12.5 }}
          >
            {t('deudas.detail.delete')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

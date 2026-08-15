import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Share, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, SHEET_TOP, SheetShell, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { dayLabel } from '@/shared/presentation/utils/dates';
import { amountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

import { debtProgress, initialOf } from '../../domain';
import { useDebtsContext } from '../context/DebtsContext';
import { debtTone } from '../utils/debtTone';
import { useDueLabel } from '../utils/useDueLabel';

import { RegistrarAbonoSheet } from './sheets/RegistrarAbonoSheet';

type Props = {
  debtId: string | null;
  currency: CurrencyCode;
  writingOff?: boolean;
  onClose: () => void;
  onWriteOff: () => void;
  onReopen: () => void;
  onDelete: () => void;
  onPaid: (amount: number) => void;
};

/** What the chips offer before "todo". Round numbers, not percentages: nobody
 *  hands a friend 25% of what they owe. */
const QUICK = [50_000, 100_000];

/**
 * One debt, as a sheet over the list it came from.
 *
 * It used to replace the whole screen, which meant leaving Deudas to look at one
 * of its lines and coming back to a list that had to redraw. As a sheet the list
 * stays behind it, and closing is the same gesture as anywhere else in the app.
 *
 * **Everything the old screen could do is still here**, moved into the grammar
 * the design uses rather than dropped: sharing and deleting are icons in the
 * header, giving up is the wide button at the bottom, and taking it back appears
 * in its place once a debt has been given up. The quick amounts fill the
 * repayment sheet instead of saving on their own, because a repayment needs an
 * account and a chip cannot name one.
 */
export function DeudaDetailSheet({
  debtId,
  currency,
  writingOff = false,
  onClose,
  onWriteOff,
  onReopen,
  onDelete,
  onPaid,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { today, debtById, counterpartyById, eventById } = useDebtsContext();

  const [abono, setAbono] = useState<number | undefined>(undefined);
  const [abonoOpen, setAbonoOpen] = useState(false);
  const [askingDelete, setAskingDelete] = useState(false);
  const [askingWriteOff, setAskingWriteOff] = useState(false);

  const deuda = debtId ? debtById[debtId] : undefined;
  const person = deuda ? counterpartyById[deuda.counterpartyId] : undefined;
  const event = deuda?.eventId ? eventById[deuda.eventId] : undefined;
  const dueLabel = useDueLabel(deuda ?? null, today);

  useEffect(() => {
    if (debtId === null) return;
    setAskingDelete(false);
    setAskingWriteOff(false);
  }, [debtId]);

  const visible = debtId !== null && deuda !== undefined && person !== undefined;
  const tone = deuda ? debtTone(theme, deuda.direction) : theme.colors.textPrimary;
  const givenUp = deuda?.status === 'written_off';

  const openAbono = (amount?: number) => {
    setAbono(amount);
    setAbonoOpen(true);
  };

  const handleShare = () => {
    if (!deuda || !person) return;
    const pct = Math.round(debtProgress(deuda) * 100);
    const parts = [
      t(
        deuda.direction === 'incoming'
          ? 'deudas.share.messageIncoming'
          : 'deudas.share.messageOutgoing',
        {
          name: person.name,
          balance: formatMoney(deuda.remaining, currency),
          total: formatMoney(deuda.amount, currency),
          pct,
        },
      ),
    ];
    if (event) parts.push(t('deudas.share.ofEvent', { event: event.name }));
    void Share.share({ message: parts.join(' · ') }).catch(() => undefined);
  };

  return (
    <SheetShell
      visible={visible}
      onClose={onClose}
      top={SHEET_TOP.detail}
      header={
        deuda && person ? (
          <>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.bgFloat,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text color={tone} style={{ fontSize: 15, fontWeight: '600' }}>
                {initialOf(person.name)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '500' }}>
                {person.name}
              </Text>
              <Text
                numberOfLines={1}
                color={theme.colors.textTertiary}
                style={{ fontSize: 11.5, marginTop: 2 }}
              >
                {event
                  ? t('deudas.detail.partOf', { event: event.name })
                  : t(
                      deuda.direction === 'incoming'
                        ? 'deudas.detail.subTheyOweYou'
                        : 'deudas.detail.subYouOweThem',
                    )}
              </Text>
            </View>
            <HeaderIcon
              icon="share"
              label={t('deudas.share.button')}
              onPress={handleShare}
            />
            <HeaderIcon
              icon="trash"
              label={t('deudas.detail.delete')}
              tone={askingDelete ? theme.colors.accentCoral : undefined}
              onPress={() => (askingDelete ? onDelete() : setAskingDelete(true))}
            />
          </>
        ) : null
      }
      overlays={
        <RegistrarAbonoSheet
          visible={abonoOpen}
          debtId={debtId}
          initialAmount={abono}
          currency={currency}
          onClose={() => setAbonoOpen(false)}
          onSaved={onPaid}
        />
      }
    >
      {deuda && person ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingHorizontal: 26,
                paddingTop: 22,
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 4,
              }}
            >
              <Text
                color={theme.colors.textTertiary}
                style={{ fontSize: 19, fontWeight: '300' }}
              >
                $
              </Text>
              <Text
                tabular
                color={tone}
                style={{
                  fontSize: 44,
                  fontWeight: '500',
                  letterSpacing: -2.2,
                }}
              >
                {amountDigits(deuda.remaining, currency)}
              </Text>
            </View>

            <Text
              color={theme.colors.textTertiary}
              style={{ paddingHorizontal: 26, paddingTop: 8, fontSize: 12.5 }}
            >
              {t('deudas.detail.ofOriginal', {
                amount: formatMoney(deuda.amount, currency),
              })}
              {deuda.dueOn ? ` · ${dueLabel}` : ''}
            </Text>

            {askingDelete ? (
              <Notice tone={theme.colors.accentCoral}>
                {t('deudas.confirmDelete.body')}
              </Notice>
            ) : null}

            {givenUp && deuda.writtenOffOn ? (
              <Notice tone={theme.colors.textTertiary}>
                {t('deudas.writeOff.banner', {
                  date: dayLabel(deuda.writtenOffOn, today, i18n.language, {
                    today: t('movements.days.today'),
                    yesterday: t('movements.days.yesterday'),
                  }),
                })}
              </Notice>
            ) : null}

            <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
              <Text
                variant="micro"
                uppercase
                color={theme.colors.textTertiary}
                style={{ letterSpacing: 2.2, marginBottom: 6 }}
              >
                {t('deudas.detail.payments')}
              </Text>
              {deuda.payments.length === 0 ? (
                <Text
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 12.5, paddingVertical: 12 }}
                >
                  {t('deudas.detail.noPayments')}
                </Text>
              ) : (
                deuda.payments.map((payment) => (
                  <View
                    key={payment.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 11,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.borderSubtle,
                    }}
                  >
                    <Text color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
                      {dayLabel(payment.paidOn, today, i18n.language, {
                        today: t('movements.days.today'),
                        yesterday: t('movements.days.yesterday'),
                      })}
                    </Text>
                    <Text tabular style={{ fontSize: 13.5 }}>
                      {formatMoney(payment.amount, currency)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Only while there is something to collect. A settled debt offering
              "abonar" would be asking for money that is not owed. */}
          {!givenUp && deuda.remaining > 0 ? (
            <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
              <Text
                variant="micro"
                uppercase
                color={theme.colors.textTertiary}
                style={{ letterSpacing: 2.2, marginBottom: 10 }}
              >
                {t('deudas.detail.payLabel')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {QUICK.filter((amount) => amount < deuda.remaining).map((amount) => (
                  <Chip
                    key={amount}
                    label={formatMoney(amount, currency)}
                    onPress={() => openAbono(amount)}
                  />
                ))}
                <Chip
                  accent
                  label={t('deudas.detail.payAll')}
                  onPress={() => openAbono(deuda.remaining)}
                />
                <Chip label={t('deudas.detail.payOther')} onPress={() => openAbono()} />
              </View>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 22,
              paddingTop: 14,
              paddingBottom: 34,
            }}
          >
            {givenUp ? (
              <WideButton label={t('deudas.writeOff.reopen')} onPress={onReopen} />
            ) : (
              <WideButton
                label={
                  askingWriteOff ? t('deudas.writeOff.cta') : t('deudas.writeOff.action')
                }
                tone={askingWriteOff ? theme.colors.accentCoral : undefined}
                disabled={writingOff}
                onPress={() => (askingWriteOff ? onWriteOff() : setAskingWriteOff(true))}
              />
            )}
            <WideButton solid label={t('deudas.detail.done')} onPress={onClose} />
          </View>
        </>
      ) : null}
    </SheetShell>
  );
}

/** A round icon in the sheet header — share, delete. */
function HeaderIcon({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: string;
  label: string;
  tone?: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          tone === undefined ? theme.colors.bgSurface : withAlpha(tone, 0.16),
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon
        name={icon}
        size={15}
        stroke={1.9}
        color={tone ?? theme.colors.textSecondary}
      />
    </Pressable>
  );
}

/** A line the sheet says back before it does something irreversible. */
function Notice({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <Text
      color={tone}
      style={{ paddingHorizontal: 26, paddingTop: 14, fontSize: 12, lineHeight: 18 }}
    >
      {children}
    </Text>
  );
}

function Chip({
  label,
  accent = false,
  onPress,
}: {
  label: string;
  accent?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: accent
          ? withAlpha(theme.palette.acc, 0.16)
          : theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: accent
          ? withAlpha(theme.palette.acc, 0.24)
          : theme.colors.borderSubtle,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        tabular
        color={accent ? theme.palette.acc3 : theme.colors.textPrimary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function WideButton({
  label,
  tone,
  solid = false,
  disabled = false,
  onPress,
}: {
  label: string;
  tone?: string;
  solid?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: solid
          ? theme.colors.textPrimary
          : tone === undefined
            ? theme.colors.bgFloat
            : withAlpha(tone, 0.16),
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      })}
    >
      <Text
        color={solid ? theme.colors.bgBase : (tone ?? theme.colors.textSecondary)}
        style={{ fontSize: 13, fontWeight: solid ? '600' : '400' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

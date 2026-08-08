import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { Button, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DebtDraft, DebtDraftOverrides } from '../../domain/types/Assistant';

type Props = {
  debtDraft: DebtDraft;
  today: string;
  /** Carries the account (and the person) the user picked on the card. */
  onConfirm?: (overrides?: DebtDraftOverrides) => void;
  onDiscard?: () => void;
  busy?: boolean;
};

/** `null` is a real choice here, not "unanswered": a split moved no cash. */
const NO_ACCOUNT = '__none__';

/**
 * "Le presté 50 mil a Andrés" — or "Santiago me pagó 2.000" — waiting for a human yes.
 *
 * It asks the two things the agent is not allowed to decide. **Which account** —
 * because confirming really moves that balance, and a wrong guess would be the app
 * quietly spending the user's money from the wrong place. **Which person** — but
 * only when the spoken name matched nobody: a name that already exists in the
 * ledger resolves on the server, since a second "Andrés" would split his debts
 * across two people who are the same person.
 *
 * The account question is phrased from the money's point of view, and the two kinds
 * point opposite ways. Lending on a debt they owe you takes cash OUT; being paid
 * back on that same debt brings it IN. Asking "¿de qué cuenta salió?" over money
 * that is landing is how this card first shipped, and it read as a bug because it
 * was one.
 *
 * "No movió plata" is offered on a NEW debt as an equal option, not an escape hatch:
 * a dinner split records who owes what and moves nothing, because the bill already
 * left as one expense. A payment never offers it — being paid back IS the money
 * changing hands, so there is nothing it could honestly mean.
 */
export function DebtDraftCard({
  debtDraft,
  today,
  onConfirm,
  onDiscard,
  busy = false,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const accounts = useAccounts();
  const debts = useDeudas(today);

  const [pickedAccount, setPickedAccount] = useState<string | null>(null);
  const [pickedPerson, setPickedPerson] = useState<string | null>(null);
  const [pickedDebt, setPickedDebt] = useState<string | null>(null);

  const pending = debtDraft.status === 'pending';
  const asksForAccount = debtDraft.accountId === null && pending;
  const isIncoming = debtDraft.direction === 'incoming';
  const isPayment = debtDraft.kind === 'payment';
  // Which way the cash moves, which is NOT the debt's direction: on a debt they owe
  // you, lending takes money out and being repaid brings it back in.
  const cashComesIn = isPayment ? isIncoming : !isIncoming;

  // Only when the name matched nobody: otherwise the person is already settled and
  // offering a list would invite the user to undo a correct answer.
  const people = useMemo(() => debts.data?.counterparties ?? [], [debts.data]);

  // "Me pagaron 2.000 de una deuda" names nobody, and the app already knows who owes
  // what — so it shows them rather than asking the user to remember. Each row is one
  // person's debt, which is also how a split dinner reads: the event became one debt
  // per person, so picking the debt IS picking who paid.
  const openDebts = useMemo(() => {
    const byId = Object.fromEntries(
      (debts.data?.counterparties ?? []).map((person) => [person.id, person]),
    );
    return (debts.data?.debts ?? [])
      .filter((debt) => debt.remaining > 0 && debt.status !== 'written_off')
      .map((debt) => ({
        id: debt.id,
        remaining: debt.remaining,
        direction: debt.direction,
        name: byId[debt.counterpartyId]?.name ?? '—',
        event: debt.eventId
          ? (debts.data?.events.find((e) => e.id === debt.eventId)?.name ?? null)
          : null,
      }));
  }, [debts.data]);

  const asksForDebt = isPayment && debtDraft.targetDebtId === null && pending;
  const chosenDebt = openDebts.find((debt) => debt.id === pickedDebt) ?? null;
  // Never on a payment: the person came from the debt that was found, so offering
  // a list would invite the user to point the abono at somebody else's ledger.
  const asksForPerson =
    !isPayment && debtDraft.counterpartyId === null && pending && people.length > 0;

  const accountName =
    debtDraft.accountId !== null
      ? (accounts.data?.accounts.find((a) => a.id === debtDraft.accountId)?.name ?? '—')
      : pickedAccount !== null && pickedAccount !== NO_ACCOUNT
        ? (accounts.data?.accounts.find((a) => a.id === pickedAccount)?.name ?? '—')
        : null;

  const personName =
    chosenDebt !== null
      ? chosenDebt.name
      : pickedPerson !== null
        ? (people.find((p) => p.id === pickedPerson)?.name ?? debtDraft.counterpartyName)
        : debtDraft.counterpartyName || t('assistant.debtDraft.someone');

  // The chosen debt decides which way the cash flows back, so the account question
  // follows the pick rather than a stale default.
  const paysInto =
    chosenDebt !== null ? chosenDebt.direction === 'incoming' : cashComesIn;
  const overpaying = chosenDebt !== null && debtDraft.amount > chosenDebt.remaining;

  const handleConfirm = () => {
    const overrides: DebtDraftOverrides = {};
    if (pickedAccount === NO_ACCOUNT) overrides.accountId = null;
    else if (pickedAccount !== null) overrides.accountId = pickedAccount;
    if (pickedPerson !== null) overrides.counterpartyId = pickedPerson;
    if (pickedDebt !== null) overrides.targetDebtId = pickedDebt;
    onConfirm?.(Object.keys(overrides).length > 0 ? overrides : undefined);
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgFloat,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pill variant={isPayment ? 'purple' : isIncoming ? 'mint' : 'amber'} uppercase>
          {t(
            isPayment
              ? 'assistant.debtDraft.paymentPill'
              : `assistant.debtDraft.direction.${debtDraft.direction}`,
          )}
        </Pill>
        {!pending ? (
          <Pill variant="neutral" uppercase>
            {t(`assistant.draft.status.${debtDraft.status}`)}
          </Pill>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexShrink: 1 }}>
          <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>
            {personName}
          </Text>
          <Text variant="caption" muted numberOfLines={1}>
            {[
              accountName,
              // Silent while the card is still asking: a placeholder there just
              // reads as a bug.
              pickedAccount === NO_ACCOUNT ? t('assistant.debtDraft.noAccount') : null,
              debtDraft.note,
            ]
              .filter(Boolean)
              .join(' · ') ||
              t(
                isPayment
                  ? 'assistant.debtDraft.paymentSubtitle'
                  : 'assistant.debtDraft.subtitle',
              )}
          </Text>
        </View>
        <Text variant="bodyLarge" tabular style={{ fontWeight: '500' }}>
          {formatMoney(debtDraft.amount)}
        </Text>
      </View>

      {asksForDebt ? (
        <View style={{ gap: 6, marginTop: 2 }}>
          <Text variant="label" style={{ fontSize: 12 }}>
            {t('assistant.debtDraft.whichDebt')}
          </Text>
          <View style={{ gap: 6 }}>
            {openDebts.map((debt) => {
              const active = pickedDebt === debt.id;
              return (
                <Pressable
                  key={debt.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setPickedDebt(debt.id)}
                  disabled={busy}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 9,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active
                      ? theme.colors.accentMint
                      : theme.colors.borderSubtle,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="label" numberOfLines={1} style={{ fontSize: 13 }}>
                      {debt.name}
                    </Text>
                    <Text variant="caption" muted style={{ fontSize: 11, marginTop: 1 }}>
                      {[
                        t(
                          debt.direction === 'incoming'
                            ? 'assistant.debtDraft.direction.incoming'
                            : 'assistant.debtDraft.direction.outgoing',
                        ),
                        debt.event,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Text variant="caption" muted tabular style={{ fontSize: 11.5 }}>
                    {t('assistant.debtDraft.remaining', {
                      amount: formatMoney(debt.remaining),
                    })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {overpaying ? (
            <Text
              variant="caption"
              color={theme.colors.accentCoral}
              style={{ fontSize: 11.5, lineHeight: 16 }}
            >
              {t('assistant.debtDraft.overpaying', {
                amount: formatMoney(chosenDebt?.remaining ?? 0),
              })}
            </Text>
          ) : null}
        </View>
      ) : null}

      {asksForPerson ? (
        <View style={{ gap: 6, marginTop: 2 }}>
          <Text variant="label" style={{ fontSize: 12 }}>
            {t('assistant.debtDraft.personMissing', {
              name: debtDraft.counterpartyName,
            })}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {people.map((person) => (
              <Chip
                key={person.id}
                label={person.name}
                active={pickedPerson === person.id}
                disabled={busy}
                onPress={() =>
                  setPickedPerson(pickedPerson === person.id ? null : person.id)
                }
              />
            ))}
          </View>
        </View>
      ) : null}

      {asksForAccount ? (
        <View style={{ gap: 6, marginTop: 2 }}>
          <Text variant="label" style={{ fontSize: 12 }}>
            {t(
              paysInto
                ? 'assistant.debtDraft.accountIn'
                : 'assistant.debtDraft.accountOut',
            )}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {(accounts.data?.accounts ?? []).map((account) => (
              <Chip
                key={account.id}
                label={account.name}
                active={pickedAccount === account.id}
                disabled={busy}
                onPress={() => setPickedAccount(account.id)}
              />
            ))}
            {/* A repayment always moves cash — there is nothing this could mean. */}
            {isPayment ? null : (
              <Chip
                label={t('assistant.debtDraft.noAccount')}
                active={pickedAccount === NO_ACCOUNT}
                disabled={busy}
                onPress={() => setPickedAccount(NO_ACCOUNT)}
              />
            )}
          </View>
          <Text variant="caption" muted style={{ fontSize: 11.5, lineHeight: 16 }}>
            {t(
              isPayment
                ? 'assistant.debtDraft.paymentHint'
                : 'assistant.debtDraft.accountHint',
            )}
          </Text>
        </View>
      ) : null}

      {pending ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}
        >
          <View style={{ flex: 1 }}>
            <Button
              label={t('assistant.draft.confirm')}
              onPress={handleConfirm}
              disabled={
                busy ||
                !onConfirm ||
                (asksForAccount && pickedAccount === null) ||
                (asksForDebt && pickedDebt === null) ||
                overpaying
              }
              loading={busy}
              full
            />
          </View>
          <Pressable onPress={onDiscard} disabled={busy || !onDiscard} hitSlop={8}>
            <Text variant="caption" color={theme.colors.accentCoral}>
              {t('assistant.draft.discard')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Chip({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: active ? theme.colors.accentMint : 'transparent',
        borderColor: active ? theme.colors.accentMint : theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <Text
        variant="caption"
        color={active ? theme.colors.bgBase : theme.colors.textSecondary}
        style={{ fontSize: 12.5 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

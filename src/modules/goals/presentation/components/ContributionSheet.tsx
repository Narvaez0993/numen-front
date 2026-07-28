import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { GoalInsufficientError } from '../../domain';
import {
  AmountField,
  BottomSheet,
  Button,
  FieldLabel,
  IconBox,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Goal } from '../../domain';
import { useMoveGoalFunds } from '../hooks/useGoalMutations';

type Props = {
  visible: boolean;
  goal: Goal | null;
  today: string;
  onClose: () => void;
  onSaved: (toast: string) => void;
};

const QUICK_PCTS = [0.1, 0.25, 0.5] as const;

/**
 * Money in or out of the pocket — one gesture, a direction toggle.
 *
 * The money really moves: the sheet asks WHICH account it leaves (or returns to),
 * because the transfer it records drops (or restores) that balance for real. The
 * prototype only ever bumped a stored counter.
 */
export function ContributionSheet({ visible, goal, today, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const accounts = useAccounts();
  const moveFunds = useMoveGoalFunds(today);

  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [digits, setDigits] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDirection('in');
      setDigits('');
      setFailed(null);
    }
  }, [visible]);

  const options = accounts.data?.accounts ?? [];
  const chosen = accountId ?? options[0]?.id ?? null;

  if (!goal) return null;

  const remaining = Math.max(0, goal.target - goal.saved);
  const amount = Number(digits || '0');
  const withdrawing = direction === 'out';
  const valid = amount > 0 && chosen !== null && (!withdrawing || amount <= goal.saved);
  const quickBase = withdrawing ? goal.saved : remaining;

  const handleSave = () => {
    if (!valid || !chosen || moveFunds.isPending) return;
    setFailed(null);
    moveFunds.mutate(
      { id: goal.id, direction, accountId: chosen, amount },
      {
        onSuccess: () =>
          onSaved(
            t(withdrawing ? 'goals.toast.withdrawn' : 'goals.toast.contributed', {
              amount: formatMoney(amount),
            }),
          ),
        onError: (error) => {
          setFailed(
            error instanceof GoalInsufficientError
              ? t('goals.errors.insufficient')
              : t('common.error'),
          );
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('goals.contribution.title', { name: goal.name })}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {withdrawing
              ? t('goals.contribution.holds', { amount: formatMoney(goal.saved) })
              : t('goals.contribution.remaining', { amount: formatMoney(remaining) })}
          </Text>
        </View>

        {goal.saved > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
              padding: 4,
              gap: 6,
            }}
          >
            {(['in', 'out'] as const).map((option) => {
              const active = option === direction;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setDirection(option);
                    setDigits('');
                    setFailed(null);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 9,
                    borderRadius: 9,
                    backgroundColor: active ? theme.colors.bgFloat : 'transparent',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text
                    variant="label"
                    color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
                    style={{ fontSize: 12.5 }}
                  >
                    {t(
                      option === 'in'
                        ? 'goals.contribution.directionIn'
                        : 'goals.contribution.directionOut',
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View>
          <FieldLabel
            label={t(
              withdrawing
                ? 'goals.contribution.toAccount'
                : 'goals.contribution.fromAccount',
            )}
          />
          <View style={{ gap: 8 }}>
            {options.map((account) => {
              const active = account.id === chosen;
              return (
                <Pressable
                  key={account.id}
                  onPress={() => setAccountId(account.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active
                      ? theme.colors.accentMint
                      : theme.colors.borderSubtle,
                    backgroundColor: theme.colors.bgSurface,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <IconBox
                    name={account.icon}
                    color={account.color}
                    size={30}
                    iconSize={14}
                    radius={9}
                  />
                  <Text
                    variant="label"
                    numberOfLines={1}
                    style={{ flex: 1, fontSize: 13 }}
                  >
                    {account.name}
                  </Text>
                  <Text variant="caption" muted tabular style={{ fontSize: 11.5 }}>
                    {formatMoney(account.balance)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <FieldLabel label={t('goals.contribution.amount')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {QUICK_PCTS.map((pct) => {
            const value = Math.round(quickBase * pct);
            if (value <= 0) return null;
            return (
              <Pressable
                key={pct}
                onPress={() => setDigits(String(value))}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: theme.colors.bgFloat,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text variant="label" style={{ fontSize: 12 }}>
                  {Math.round(pct * 100)}%
                </Text>
              </Pressable>
            );
          })}
        </View>

        {failed ? (
          <Text
            variant="caption"
            color={theme.colors.accentCoral}
            style={{ fontSize: 11.5 }}
          >
            {failed}
          </Text>
        ) : null}

        <Button
          label={t(
            withdrawing ? 'goals.contribution.saveOut' : 'goals.contribution.save',
          )}
          full
          disabled={!valid || moveFunds.isPending}
          onPress={handleSave}
        />
      </View>
    </BottomSheet>
  );
}

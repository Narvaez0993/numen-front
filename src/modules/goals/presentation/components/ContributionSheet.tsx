import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  ChooseSheet,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { GoalInsufficientError, type Goal } from '../../domain';
import { useMoveGoalFunds } from '../hooks/useGoalMutations';

type Props = {
  visible: boolean;
  goal: Goal | null;
  today: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const DIRECTIONS = ['in', 'out'] as const;

/**
 * Money in or out of the pocket.
 *
 * The money really moves, and that is why the sheet asks WHICH account: the
 * transfer it records drops — or restores — that balance for real. A stored
 * counter would need none of this, and would be a lie the first time the two
 * numbers disagreed.
 *
 * The direction is a switch in the header, where the manual capture puts
 * gasto/ingreso, and it only appears once there is something to take back out.
 */
export function ContributionSheet({ visible, goal, today, onClose, onSaved }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const currency = useCurrencyStore((s) => s.currency) as CurrencyCode;
  const accounts = useAccounts();
  const moveFunds = useMoveGoalFunds(today);

  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [digits, setDigits] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDirection('in');
    setDigits('');
    setFailed(null);
  }, [visible]);

  const options = accounts.data?.accounts ?? [];
  const chosen = accountId ?? options[0]?.id ?? null;

  if (!goal) return null;

  const remaining = Math.max(0, goal.target - goal.saved);
  const amount = Number(digits || '0');
  const withdrawing = direction === 'out';
  const valid = amount > 0 && chosen !== null && (!withdrawing || amount <= goal.saved);

  const handleSave = () => {
    if (!valid || !chosen || moveFunds.isPending) return;
    setFailed(null);
    moveFunds.mutate(
      { id: goal.id, direction, accountId: chosen, amount },
      {
        onSuccess: () =>
          onSaved(
            t(withdrawing ? 'goals.toast.withdrawn' : 'goals.toast.contributed', {
              amount: formatMoney(amount, currency),
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
    <>
      <AmountSheet
        visible={visible}
        onClose={onClose}
        digits={digits}
        onDigits={setDigits}
        currency={currency}
        label={t(withdrawing ? 'goals.contribution.take' : 'goals.contribution.put')}
        help={
          failed ??
          (withdrawing
            ? t('goals.contribution.holds', {
                amount: formatMoney(goal.saved, currency),
              })
            : t('goals.contribution.remaining', {
                amount: formatMoney(remaining, currency),
              }))
        }
        amountColor={failed !== null ? theme.colors.accentCoral : undefined}
        primaryLabel={t(
          withdrawing ? 'goals.contribution.saveOut' : 'goals.contribution.saveIn',
        )}
        primaryDisabled={!valid || moveFunds.isPending}
        onPrimary={handleSave}
        header={
          <>
            <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
            {/* Taking money back out only exists once there is some in there. */}
            {goal.saved > 0 ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  gap: 6,
                  padding: 3,
                  borderRadius: 14,
                  backgroundColor: theme.colors.bgSurface,
                }}
              >
                {DIRECTIONS.map((option) => {
                  const active = option === direction;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setDirection(option)}
                      style={({ pressed }) => ({
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderRadius: 11,
                        backgroundColor: active ? theme.colors.bgElevated : 'transparent',
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        color={
                          active ? theme.colors.textPrimary : theme.colors.textTertiary
                        }
                        style={{ fontSize: 12.5, fontWeight: '500' }}
                      >
                        {t(`goals.contribution.direction.${option}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 16, fontWeight: '500' }}
              >
                {goal.name}
              </Text>
            )}
          </>
        }
        overlays={
          <>
            <ChooseSheet
              visible={picking}
              title={t(withdrawing ? 'goals.contribution.to' : 'goals.contribution.from')}
              options={options.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
              value={chosen}
              onChange={setAccountId}
              onClose={() => setPicking(false)}
            />
          </>
        }
      >
        <SheetFieldRow
          label={t(withdrawing ? 'goals.contribution.to' : 'goals.contribution.from')}
          value={options.find((a) => a.id === chosen)?.name ?? '—'}
          chevron
          onPress={() => setPicking(true)}
        />
      </AmountSheet>
    </>
  );
}

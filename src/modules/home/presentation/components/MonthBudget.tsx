import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CeilingSheet } from '@/modules/budgets/presentation/components/sheets/CeilingSheet';
import { useCreateBudget } from '@/modules/budgets/presentation/hooks/useBudgetMutations';
import type { BudgetCap } from '@/modules/home/domain/types/HomeOverview';
import type { CurrencyCode } from '@/shared/domain';
import { DashedButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, shiftMonth } from '@/shared/presentation/utils/dates';

import { BudgetPulse } from './BudgetPulse';

type Props = {
  /** `null` while no ceiling exists — the server sends no figure at all then. */
  budget: BudgetCap | null;
  daysLeft: number;
  elapsed: number;
  today: string;
  currency: CurrencyCode;
  onOpenBudgets: () => void;
};

/**
 * Home's place for the month's ceiling.
 *
 * With one, the pulse: what is left and the daily figure that would spend it.
 * Without one (HU-25 «Nunca una figura sin datos», HU-29 «Sin tope definido no
 * hay cifra diaria») there is no bar and no number — a daily figure divides a
 * limit the user chose, and there is none to divide. In their place the offer
 * to set one, which opens the very sheet Presupuesto uses to create and later
 * edit it, right here: the ceiling is a number, and asking for it does not need
 * a trip to another tab.
 */
export function MonthBudget({
  budget,
  daysLeft,
  elapsed,
  today,
  currency,
  onOpenBudgets,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const createBudget = useCreateBudget(today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (budget) {
    return (
      <BudgetPulse
        budget={budget}
        daysLeft={daysLeft}
        elapsed={elapsed}
        onPress={onOpenBudgets}
      />
    );
  }

  const save = async (amount: number) => {
    setFailed(false);
    setSheetOpen(false);
    try {
      // Home reloads with the rest of the money views, and the pulse takes
      // this place on its own.
      await createBudget.mutateAsync({ scope: 'global', target: amount });
    } catch {
      setFailed(true);
    }
  };

  return (
    <View>
      <Text
        variant="micro"
        uppercase
        color={theme.colors.textTertiary}
        style={{ letterSpacing: 2.2, marginBottom: 6 }}
      >
        {t('home.budget.label')}
      </Text>
      <Text
        color={theme.colors.textSecondary}
        style={{ fontSize: 13, lineHeight: 19, marginBottom: 12 }}
      >
        {t('home.budget.none.body')}
      </Text>
      <DashedButton
        label={t('home.budget.none.cta')}
        onPress={() => setSheetOpen(true)}
      />
      {failed ? (
        <Text color={theme.colors.accentCoral} style={{ fontSize: 12, marginTop: 8 }}>
          {t('home.budget.none.failed')}
        </Text>
      ) : null}

      <CeilingSheet
        visible={sheetOpen}
        current={null}
        monthName={monthName(today, i18n.language)}
        nextMonthName={monthName(shiftMonth(today, 1), i18n.language)}
        currency={currency}
        saving={createBudget.isPending}
        onClose={() => setSheetOpen(false)}
        onSave={(amount) => void save(amount)}
      />
    </View>
  );
}

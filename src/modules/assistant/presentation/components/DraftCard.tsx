import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { ResolvedSource } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DraftOverrides, MovementDraft } from '../../domain/types/Assistant';
import { sourceOptions } from '../utils/draftSources';

import {
  AskLabel,
  ConfirmButton,
  DraftShell,
  PickChip,
  QuietAction,
} from './draftChrome';

type Props = {
  draft: MovementDraft;
  /** Carries the source the user picked when the agent did not know it. */
  onConfirm?: (overrides?: DraftOverrides) => void;
  onEdit?: () => void;
  onDiscard?: () => void;
  busy?: boolean;
};

/** The real minus sign — it lines up with digits in a tabular font. */
const MINUS = '−';

/**
 * The agent's understanding, waiting for a human yes. Nothing is saved until
 * Confirmar — and after it settles, the card keeps showing what happened
 * (the server hydrates the draft's current status into the history forever).
 *
 * Redesigned to the same rules as the movements list, for the same reasons.
 * The card used to open with a coloured GASTO/INGRESO/TRANSFERENCIA pill and a
 * mint button, which put three colours above the number the user is actually
 * being asked to check. Now **the amount leads** at the size it leads with
 * everywhere else, direction rides on its sign, and the only colour is the
 * accent — plus mint on money coming IN, which is the one case worth marking.
 */
export function DraftCard({ draft, onConfirm, onEdit, onDiscard, busy = false }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const catalogs = useMovementCatalogs();
  const [picked, setPicked] = useState<ResolvedSource | null>(null);

  // The agent is allowed not to know where the money came from — it is not
  // allowed to guess. When it doesn't, the card asks instead of the app deciding.
  const asksForSource = draft.sourceId === null && draft.status === 'pending';
  const chosen = draft.sourceId !== null ? catalogs.sourceById[draft.sourceId] : picked;

  const isIncome = draft.type === 'income';
  const isTransfer = draft.type === 'transfer';
  const source = chosen?.name ?? '—';
  const destination =
    draft.destinationId !== null
      ? (catalogs.sourceById[draft.destinationId]?.name ?? '—')
      : null;
  const category =
    draft.categoryId !== null ? catalogs.categoryById[draft.categoryId]?.name : undefined;

  const meta = [
    // While the card is still asking, the source is a question below — printing
    // a placeholder for it here would just read as a bug.
    asksForSource && chosen === null
      ? null
      : destination !== null
        ? `${source} → ${destination}`
        : source,
    category,
    shortDate(draft.occurredOn, i18n.language),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <DraftShell>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text
            tabular
            color={isIncome ? theme.colors.accentMint : theme.colors.textPrimary}
            style={{ fontSize: 29, fontWeight: '300', letterSpacing: -0.9 }}
          >
            {isIncome ? '+' : isTransfer ? '' : MINUS}
            {formatMoney(draft.amount)}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
            {draft.description || t('assistant.draft.transferFallback')}
          </Text>
          {meta ? (
            <Text
              numberOfLines={1}
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5 }}
            >
              {meta}
            </Text>
          ) : null}
        </View>

        {draft.status !== 'pending' ? (
          <Pill variant="neutral" uppercase>
            {t(`assistant.draft.status.${draft.status}`)}
          </Pill>
        ) : null}
      </View>

      {asksForSource ? (
        <View style={{ gap: 10 }}>
          {/* An income does not "come from" anywhere — it lands. Asking the
              expense question over money that is arriving reads as a bug. */}
          <AskLabel>{t(`assistant.draft.sourceMissing.${draft.type}`)}</AskLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sourceOptions(catalogs.sourceById, draft.type).map((option) => (
              <PickChip
                key={option.id}
                label={option.name}
                active={picked?.id === option.id}
                disabled={busy}
                onPress={() => setPicked(option)}
              />
            ))}
          </View>
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, lineHeight: 16 }}
          >
            {t(`assistant.draft.sourceHint.${draft.type}`)}
          </Text>
        </View>
      ) : null}

      {draft.status === 'pending' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ConfirmButton
            label={t('assistant.draft.confirm')}
            onPress={() =>
              onConfirm?.(
                picked !== null
                  ? {
                      sourceId: picked.id,
                      sourceType: picked.type as 'account' | 'credit_card',
                    }
                  : undefined,
              )
            }
            disabled={busy || !onConfirm || (asksForSource && picked === null)}
          />
          <QuietAction
            label={t('assistant.draft.edit')}
            onPress={onEdit}
            disabled={busy}
          />
          <QuietAction
            label={t('assistant.draft.discard')}
            onPress={onDiscard}
            disabled={busy}
            danger
          />
        </View>
      ) : null}
    </DraftShell>
  );
}

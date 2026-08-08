import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { ResolvedSource } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Button, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DraftOverrides, MovementDraft } from '../../domain/types/Assistant';
import { sourceOptions } from '../utils/draftSources';

type Props = {
  draft: MovementDraft;
  /** Carries the source the user picked when the agent did not know it. */
  onConfirm?: (overrides?: DraftOverrides) => void;
  onEdit?: () => void;
  onDiscard?: () => void;
  busy?: boolean;
};

const TYPE_PILL: Record<MovementDraft['type'], 'coral' | 'mint' | 'purple'> = {
  expense: 'coral',
  income: 'mint',
  transfer: 'purple',
};

/**
 * The agent's understanding, waiting for a human yes. Nothing is saved until
 * Confirmar — and after it settles, the card keeps showing what happened
 * (the server hydrates the draft's current status into the history forever).
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

  const source = chosen?.name ?? '—';
  const destination =
    draft.destinationId !== null
      ? (catalogs.sourceById[draft.destinationId]?.name ?? '—')
      : null;
  const category =
    draft.categoryId !== null ? catalogs.categoryById[draft.categoryId]?.name : undefined;

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
        <Pill variant={TYPE_PILL[draft.type]} uppercase>
          {t(`assistant.draft.type.${draft.type}`)}
        </Pill>
        {draft.status !== 'pending' ? (
          <Pill variant="neutral" uppercase>
            {t(`assistant.draft.status.${draft.status}`)}
          </Pill>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexShrink: 1 }}>
          <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>
            {draft.description || t('assistant.draft.transferFallback')}
          </Text>
          <Text variant="caption" muted numberOfLines={1}>
            {[
              // While the card is still asking, the source is a question below —
              // printing a placeholder for it here would just read as a bug.
              asksForSource && chosen === null
                ? null
                : destination !== null
                  ? `${source} → ${destination}`
                  : source,
              category,
              shortDate(draft.occurredOn, i18n.language),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <Text variant="bodyLarge" tabular style={{ fontWeight: '500' }}>
          {formatMoney(draft.amount)}
        </Text>
      </View>

      {asksForSource ? (
        <View style={{ gap: 6, marginTop: 2 }}>
          <Text variant="label" style={{ fontSize: 12 }}>
            {/* An income does not "come from" anywhere — it lands. Asking the
                expense question over a green INGRESO pill reads as a bug. */}
            {t(`assistant.draft.sourceMissing.${draft.type}`)}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {sourceOptions(catalogs.sourceById, draft.type).map((option) => {
              const active = picked?.id === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setPicked(option)}
                  disabled={busy}
                  style={{
                    backgroundColor: active ? theme.colors.accentMint : 'transparent',
                    borderColor: active
                      ? theme.colors.accentMint
                      : theme.colors.borderSubtle,
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
                    {option.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="caption" muted style={{ fontSize: 11.5, lineHeight: 16 }}>
            {t(`assistant.draft.sourceHint.${draft.type}`)}
          </Text>
        </View>
      ) : null}

      {draft.status === 'pending' ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}
        >
          <View style={{ flex: 1 }}>
            <Button
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
              loading={busy}
              full
            />
          </View>
          <Pressable onPress={onEdit} disabled={busy || !onEdit} hitSlop={8}>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('assistant.draft.edit')}
            </Text>
          </Pressable>
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

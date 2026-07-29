import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Button, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { MovementDraft } from '../../domain/types/Assistant';

type Props = {
  draft: MovementDraft;
  onConfirm?: () => void;
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

  const source = catalogs.sourceById[draft.sourceId]?.name ?? '—';
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
            {destination !== null ? `${source} → ${destination}` : source}
            {category ? ` · ${category}` : ''}
            {` · ${shortDate(draft.occurredOn, i18n.language)}`}
          </Text>
        </View>
        <Text variant="bodyLarge" tabular style={{ fontWeight: '500' }}>
          {formatMoney(draft.amount)}
        </Text>
      </View>

      {draft.status === 'pending' ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}
        >
          <View style={{ flex: 1 }}>
            <Button
              label={t('assistant.draft.confirm')}
              onPress={onConfirm ?? (() => {})}
              disabled={busy || !onConfirm}
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

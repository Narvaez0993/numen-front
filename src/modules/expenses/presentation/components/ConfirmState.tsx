import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MovementDraft } from '@/modules/assistant/domain/types/Assistant';
import { DraftCard } from '@/modules/assistant/presentation/components/DraftCard';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  draft: MovementDraft;
  /** What the mic heard — `null` for typed captures, which need no echo. */
  transcript: string | null;
  busy: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onDiscard: () => void;
};

/** What the agent understood, one tap from being real. Same card as the chat. */
export function ConfirmState({
  draft,
  transcript,
  busy,
  onConfirm,
  onEdit,
  onDiscard,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ paddingTop: 4, gap: 14 }}>
      <View>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t('expenses.sheet.confirm.title')}
        </Text>
        {transcript !== null ? (
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('expenses.sheet.confirm.said')}{' '}
            <Text variant="caption">“{transcript}”</Text>
          </Text>
        ) : null}
      </View>

      <DraftCard
        draft={draft}
        busy={busy}
        onConfirm={onConfirm}
        onEdit={onEdit}
        onDiscard={onDiscard}
      />
    </View>
  );
}

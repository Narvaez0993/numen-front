import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type {
  AssistantBlock,
  DebtDraft,
  DebtDraftOverrides,
  DraftOverrides,
  MovementDraft,
} from '../../domain/types/Assistant';
import { isAssistantRoute } from '../../domain/types/Assistant';
import { DebtDraftCard } from './DebtDraftCard';
import { DraftCard } from './DraftCard';
import { FormattedText } from './FormattedText';
import { MiniBarChart } from './MiniBarChart';
import { RichStat } from './RichStat';

type DraftHandlers = {
  onConfirm: (draft: MovementDraft, overrides?: DraftOverrides) => void;
  onEdit: (draft: MovementDraft) => void;
  onDiscard: (draft: MovementDraft) => void;
  busyDraftId: string | null;
};

type DebtDraftHandlers = {
  today: string;
  onConfirm: (draft: DebtDraft, overrides?: DebtDraftOverrides) => void;
  onDiscard: (draft: DebtDraft) => void;
  busyDraftId: string | null;
};

type Props = {
  block: AssistantBlock;
  draftHandlers?: DraftHandlers;
  debtDraftHandlers?: DebtDraftHandlers;
};

/** One agent block → the component that already knew how to draw it. */
export function BlockView({ block, draftHandlers, debtDraftHandlers }: Props) {
  const { theme } = useTheme();

  switch (block.type) {
    case 'text':
      return <FormattedText text={block.text} />;
    case 'stat':
      return (
        <View style={{ flexDirection: 'row' }}>
          <RichStat label={block.label} value={block.value} />
        </View>
      );
    case 'chart':
      return (
        <View style={{ gap: 6 }}>
          <Text variant="caption" muted>
            {block.title}
          </Text>
          <MiniBarChart data={block.points} />
        </View>
      );
    case 'navigate': {
      // The server allowlists routes; the typed twin is the client's seatbelt.
      if (!isAssistantRoute(block.route)) {
        return null;
      }
      const route = block.route;
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(route)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            backgroundColor: theme.colors.bgFloat,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text variant="caption" color={theme.colors.accentMint}>
            {block.label}
          </Text>
          <Icon name="chevron-right" size={13} color={theme.colors.accentMint} />
        </Pressable>
      );
    }
    case 'draft':
      return (
        <DraftCard
          draft={block.draft}
          busy={draftHandlers?.busyDraftId === block.draft.id}
          onConfirm={
            draftHandlers
              ? (overrides) => draftHandlers.onConfirm(block.draft, overrides)
              : undefined
          }
          onEdit={draftHandlers ? () => draftHandlers.onEdit(block.draft) : undefined}
          onDiscard={
            draftHandlers ? () => draftHandlers.onDiscard(block.draft) : undefined
          }
        />
      );
    case 'debt_draft':
      if (!debtDraftHandlers) return null;
      return (
        <DebtDraftCard
          debtDraft={block.debtDraft}
          today={debtDraftHandlers.today}
          busy={debtDraftHandlers.busyDraftId === block.debtDraft.id}
          onConfirm={(overrides) =>
            debtDraftHandlers.onConfirm(block.debtDraft, overrides)
          }
          onDiscard={() => debtDraftHandlers.onDiscard(block.debtDraft)}
        />
      );
    default:
      return null;
  }
}

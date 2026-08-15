import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  SHEET_TOP,
  SheetHeaderButton,
  SheetShell,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AssistantUsage, ChatMessage } from '../../domain/types/Assistant';

import { UsageMeter } from './UsageMeter';

type Props = {
  visible: boolean;
  messages: ChatMessage[];
  usage: AssistantUsage | undefined;
  onClose: () => void;
};

/** The text of a message, which is all this view shows: a card or a chart out of
 *  its answer is a fragment, and the answer it belonged to is one tap away. */
function textOf(message: ChatMessage): string {
  return message.blocks
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n');
}

/**
 * Everything that has been asked and answered in this thread.
 *
 * The design shows one exchange at a time and never draws the transcript — which
 * is right for the screen, and wrong as the only option: a thread the app counts
 * up to thirty is a thread someone will want to look back at. So it lives here,
 * behind the count that measures it, instead of costing the answer its room.
 *
 * Newest first. You open it to find what was said a moment ago, not to read the
 * conversation from the beginning.
 */
export function ThreadSheet({ visible, messages, usage, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const shown = [...messages].reverse().filter((message) => textOf(message).length > 0);

  return (
    <SheetShell
      visible={visible}
      onClose={onClose}
      top={SHEET_TOP.detail}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('assistant.thread.title')}
          </Text>
        </>
      }
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 26,
          paddingTop: 20,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingBottom: 4 }}>
          <UsageMeter usage={usage} />
        </View>

        {shown.length === 0 ? (
          <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
            {t('assistant.thread.empty')}
          </Text>
        ) : (
          shown.map((message) => (
            <View
              key={message.id}
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.borderSubtle,
              }}
            >
              <Text
                color={theme.colors.textTertiary}
                style={{ fontSize: 11, width: 24, paddingTop: 2 }}
              >
                {t(
                  message.role === 'user'
                    ? 'assistant.thread.you'
                    : 'assistant.thread.agent',
                )}
              </Text>
              <Text
                color={
                  message.role === 'user'
                    ? theme.colors.textSecondary
                    : theme.colors.textPrimary
                }
                style={{ flex: 1, fontSize: 13, lineHeight: 20 }}
              >
                {textOf(message)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SheetShell>
  );
}

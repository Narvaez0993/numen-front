import { Fragment } from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AssistantBlock } from '../../domain/types/Assistant';

import { BlockView, type BlockHandlers } from './BlockView';

type Props = {
  blocks: AssistantBlock[];
  handlers: BlockHandlers;
};

/**
 * The agent's answer, given the screen.
 *
 * The chat had bubbles and a transcript, and that shape makes a promise this
 * assistant does not keep: that you came to have a conversation. You came to ask
 * one thing about your money. So the answer opens at 27px and the question that
 * caused it sits above it in 12.5px grey — the same inversion the design uses on
 * Home, where the sentence leads and the figure follows.
 *
 * **The first sentence is the answer; everything after it is support.** Only the
 * opening text block gets the large size. A second paragraph at 27px would be a
 * wall, and the closing line is a remark rather than a headline, so it drops to
 * 14px. Cards, charts and drafts keep their own sizes and sit between the two.
 */
export function AnswerView({ blocks, handlers }: Props) {
  const { theme } = useTheme();

  const firstText = blocks.findIndex((block) => block.type === 'text');
  const lead = firstText >= 0 ? blocks[firstText] : undefined;

  // Two cards side by side is the design's pairing — a figure next to its shape
  // over time. More than two would not fit, so they stack as usual.
  const rest = blocks.filter((_, index) => index !== firstText);
  const cards = rest.filter((block) => block.type === 'stat' || block.type === 'chart');
  const paired = cards.length === 2;

  return (
    <View>
      {lead?.type === 'text' ? (
        <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
          <Text
            style={{
              fontSize: 27,
              lineHeight: 34,
              fontWeight: '300',
              letterSpacing: -0.8,
            }}
          >
            {lead.text}
          </Text>
        </View>
      ) : null}

      {paired ? (
        <View
          style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 22 }}
        >
          {cards.map((block, index) => (
            <View key={`card-${index}`} style={{ flex: 1, minWidth: 0 }}>
              <BlockView {...handlers} block={block} />
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
        {rest.map((block, index) => {
          if (paired && (block.type === 'stat' || block.type === 'chart')) return null;
          return (
            <Fragment key={`block-${index}`}>
              {block.type === 'text' ? (
                <Text
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 14, lineHeight: 22, paddingHorizontal: 2 }}
                >
                  {block.text}
                </Text>
              ) : (
                <BlockView {...handlers} block={block} />
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

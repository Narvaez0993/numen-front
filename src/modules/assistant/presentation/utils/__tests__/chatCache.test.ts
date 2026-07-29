import type {
  ChatHistory,
  ChatMessage,
  MovementDraft,
} from '../../../domain/types/Assistant';
import {
  appendMessages,
  localUserMessage,
  removeMessage,
  replaceDraft,
} from '../chatCache';

const draft = (overrides: Partial<MovementDraft> = {}): MovementDraft => ({
  id: 'd-1',
  type: 'expense',
  description: 'Almuerzo',
  amount: 25_000,
  currency: 'COP',
  sourceType: 'account',
  sourceId: 'acc-1',
  destinationType: null,
  destinationId: null,
  categoryId: 'comida',
  occurredOn: '2026-07-28',
  status: 'pending',
  movementId: null,
  ...overrides,
});

const message = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm-1',
  role: 'assistant',
  blocks: [{ type: 'draft', draft: draft() }],
  createdAt: '2026-07-28T12:00:00Z',
  ...overrides,
});

const history = (messages: ChatMessage[]): ChatHistory => ({
  messages,
  nextBefore: null,
});

describe('appendMessages', () => {
  it('appends to an empty cache without inventing one', () => {
    const result = appendMessages(undefined, [message()]);
    expect(result.messages).toHaveLength(1);
    expect(result.nextBefore).toBeNull();
  });

  it('keeps existing messages and pagination cursor', () => {
    const base = { messages: [message({ id: 'old' })], nextBefore: 'cursor' };
    const result = appendMessages(base, [message({ id: 'new' })]);
    expect(result.messages.map((m) => m.id)).toEqual(['old', 'new']);
    expect(result.nextBefore).toBe('cursor');
  });
});

describe('removeMessage', () => {
  it('removes exactly the optimistic bubble', () => {
    const base = history([
      message({ id: 'local-1', role: 'user' }),
      message({ id: 'm-2' }),
    ]);
    const result = removeMessage(base, 'local-1');
    expect(result.messages.map((m) => m.id)).toEqual(['m-2']);
  });
});

describe('replaceDraft', () => {
  it('flips the draft status inside whatever message carries it', () => {
    const base = history([
      message({ id: 'm-1' }),
      message({ id: 'm-2', blocks: [{ type: 'text', text: 'hola' }] }),
    ]);
    const confirmed = draft({ status: 'confirmed', movementId: 'mov-9' });

    const result = replaceDraft(base, confirmed);

    const block = result.messages[0]!.blocks[0]!;
    expect(block.type === 'draft' && block.draft.status).toBe('confirmed');
    expect(result.messages[1]!.blocks[0]).toEqual({ type: 'text', text: 'hola' });
  });

  it('leaves other drafts alone', () => {
    const other = draft({ id: 'd-2' });
    const base = history([message({ blocks: [{ type: 'draft', draft: other }] })]);

    const result = replaceDraft(base, draft({ status: 'discarded' }));

    const block = result.messages[0]!.blocks[0]!;
    expect(block.type === 'draft' && block.draft.status).toBe('pending');
  });
});

describe('localUserMessage', () => {
  it('wraps the text as the single block of a user message', () => {
    const result = localUserMessage('hola', 'local-9');
    expect(result.role).toBe('user');
    expect(result.blocks).toEqual([{ type: 'text', text: 'hola' }]);
  });
});

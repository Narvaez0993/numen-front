import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import { Aurora, Icon, RetryState, Text, Toast } from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import { ChatLimitReachedError } from '../../domain';
import type {
  DebtDraft,
  DebtDraftOverrides,
  DraftOverrides,
  MovementDraft,
} from '../../domain/types/Assistant';
import { AnswerView } from '../components/AnswerView';
import { ChatComposer } from '../components/ChatComposer';
import { LimitGateCard } from '../components/LimitGateCard';
import { SuggestedChips } from '../components/SuggestedChips';
import { ThreadMeter } from '../components/ThreadMeter';
import { ThreadSheet } from '../components/ThreadSheet';
import { TypingIndicator } from '../components/TypingIndicator';
import { useAssistantUsage } from '../hooks/useAssistantUsage';
import {
  useConfirmDebtDraft,
  useConfirmDraft,
  useDiscardDebtDraft,
  useDiscardDraft,
  useSendMessage,
} from '../hooks/useAssistantMutations';
import { useChatHistory } from '../hooks/useChatHistory';

const CHIP_KEYS = ['month', 'topSpend', 'upcoming'] as const;

/** The first two letters of a name, for the avatar. */
function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * The assistant, as one question and its answer.
 *
 * The transcript is gone from the screen, and that is the whole change. A chat
 * about your money is not a conversation you re-read — it is one thing you asked,
 * and the reply is what you came for. So the reply opens at 27px with the room
 * to say something, the question that caused it sits above it in grey, and the
 * thread itself becomes a count you can tap when you do want to look back.
 *
 * Nothing was dropped to get there: the drafts the agent proposes still render
 * inside the answer, the quota still gates, and the history lives behind
 * `ThreadSheet`.
 */
export function AssistantScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => toIsoDate(new Date()), []);

  const history = useChatHistory();
  const usage = useAssistantUsage(today);
  const send = useSendMessage(today);
  const confirm = useConfirmDraft(today);
  const discard = useDiscardDraft();
  const confirmDebt = useConfirmDebtDraft(today);
  const discardDebt = useDiscardDebtDraft();
  const openSheet = useExpenseSheetStore((s) => s.openSheet);
  const name = useAuthStore((s) => s.session?.displayName ?? '');

  const [input, setInput] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const tabBarClearance = useFloatingTabBarClearance();

  const messages = history.data?.messages ?? [];
  const typing = send.isPending;

  // The exchange on screen is the last one that happened. Anything before it is
  // in the thread sheet.
  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastQuestion = [...messages].reverse().find((m) => m.role === 'user');
  const questionText =
    lastQuestion?.blocks.find((block) => block.type === 'text')?.text ?? '';

  const sendMessage = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || send.isPending) return;
      setInput('');
      send.mutate(clean, {
        onError: (error) => {
          if (error instanceof ChatLimitReachedError) {
            setLimitHit(true);
            return;
          }
          setToast(t('assistant.errors.sendFailed'));
        },
      });
    },
    [send, t],
  );

  const onConfirmDraft = useCallback(
    (draft: MovementDraft, overrides?: DraftOverrides) => {
      confirm.mutate(
        { draftId: draft.id, overrides },
        {
          onSuccess: () => setToast(t('assistant.draft.saved')),
          onError: () => setToast(t('assistant.errors.confirmFailed')),
        },
      );
    },
    [confirm, t],
  );

  const onEditDraft = useCallback(
    (draft: MovementDraft) => {
      // The full manual form, prefilled: precision is one tap away, and saving
      // routes back through this draft so it settles as confirmed.
      openSheet('manual', draft.type, draft);
    },
    [openSheet],
  );

  const onDiscardDraft = useCallback(
    (draft: MovementDraft) => {
      discard.mutate(draft.id, {
        onError: () => setToast(t('assistant.errors.discardFailed')),
      });
    },
    [discard, t],
  );

  const onConfirmDebtDraft = useCallback(
    (draft: DebtDraft, overrides?: DebtDraftOverrides) => {
      confirmDebt.mutate(
        { draftId: draft.id, overrides },
        {
          onSuccess: () => setToast(t('assistant.debtDraft.saved')),
          onError: () => setToast(t('assistant.debtDraft.confirmFailed')),
        },
      );
    },
    [confirmDebt, t],
  );

  const onDiscardDebtDraft = useCallback(
    (draft: DebtDraft) => {
      discardDebt.mutate(draft.id, {
        onError: () => setToast(t('assistant.errors.discardFailed')),
      });
    },
    [discardDebt, t],
  );

  const busyDebtDraftId = confirmDebt.isPending
    ? (confirmDebt.variables?.draftId ?? null)
    : discardDebt.isPending
      ? (discardDebt.variables ?? null)
      : null;

  const busyDraftId = confirm.isPending
    ? (confirm.variables?.draftId ?? null)
    : discard.isPending
      ? (discard.variables ?? null)
      : null;

  const messagesUsage = usage.data?.messages;
  const overLimit =
    messagesUsage !== undefined &&
    messagesUsage.used >= messagesUsage.limit + messagesUsage.grace;
  const gateVisible = limitHit || overLimit;

  return (
    <Aurora>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 22,
            paddingTop: 14,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => router.push('/')}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon
              name="arrow-left"
              size={16}
              stroke={2}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <Text style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('assistant.title')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.title')}
            onPress={() => router.push('/profile')}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(theme.palette.acc, 0.16),
              borderWidth: 1,
              borderColor: withAlpha(theme.palette.acc, 0.22),
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text color={theme.palette.acc3} style={{ fontSize: 13, fontWeight: '600' }}>
              {initialsOf(name) || '·'}
            </Text>
          </Pressable>
        </View>

        <ThreadMeter usage={usage.data} onPress={() => setThreadOpen(true)} />

        {questionText ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              paddingHorizontal: 24,
              paddingTop: 14,
            }}
          >
            <Text color={theme.colors.textTertiary} style={{ fontSize: 11, width: 16 }}>
              {t('assistant.thread.you')}
            </Text>
            <Text
              numberOfLines={2}
              color={theme.colors.textPrimary}
              style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}
            >
              {questionText}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.borderSubtle,
            marginHorizontal: 24,
            marginTop: 18,
          }}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {history.isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color={theme.palette.acc} />
            </View>
          ) : history.isError ? (
            <RetryState
              titleKey="assistant.errors.title"
              retryKey="assistant.errors.retry"
              onRetry={() => void history.refetch()}
            />
          ) : typing ? (
            <View style={{ paddingHorizontal: 26, paddingTop: 30 }}>
              <TypingIndicator />
            </View>
          ) : lastAnswer ? (
            <AnswerView
              blocks={lastAnswer.blocks}
              handlers={{
                draftHandlers: {
                  onConfirm: onConfirmDraft,
                  onEdit: onEditDraft,
                  onDiscard: onDiscardDraft,
                  busyDraftId,
                },
                debtDraftHandlers: {
                  today,
                  onConfirm: onConfirmDebtDraft,
                  onDiscard: onDiscardDebtDraft,
                  busyDraftId: busyDebtDraftId,
                },
              }}
            />
          ) : (
            <View style={{ paddingHorizontal: 26, paddingTop: 30 }}>
              <Text
                style={{
                  fontSize: 27,
                  lineHeight: 34,
                  fontWeight: '300',
                  letterSpacing: -0.8,
                }}
              >
                {t('assistant.empty.title')}
              </Text>
              <Text
                color={theme.colors.textTertiary}
                style={{ fontSize: 14, lineHeight: 22, marginTop: 14 }}
              >
                {t('assistant.empty.body')}
              </Text>
            </View>
          )}

          {gateVisible ? (
            <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
              <LimitGateCard onSeePlus={() => router.push('/plan')} />
            </View>
          ) : null}
        </ScrollView>

        <View style={{ paddingBottom: tabBarClearance }}>
          <SuggestedChips
            chips={CHIP_KEYS.map((key) => ({
              id: key,
              label: t(`assistant.chips.${key}`),
            }))}
            disabled={typing || gateVisible}
            onPick={(chip) => sendMessage(chip.label)}
          />
          <ChatComposer
            value={input}
            onChangeText={setInput}
            onSend={() => sendMessage(input)}
            onAttach={() => setToast(t('assistant.composer.attachSoon'))}
            disabled={typing || gateVisible}
          />
        </View>
      </KeyboardAvoidingView>

      <ThreadSheet
        visible={threadOpen}
        messages={messages}
        usage={usage.data}
        onClose={() => setThreadOpen(false)}
      />

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
      />
    </Aurora>
  );
}

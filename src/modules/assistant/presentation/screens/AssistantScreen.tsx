import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExpenseSheetStore } from '@/modules/expenses/presentation/stores/useExpenseSheetStore';
import {
  Card,
  RetryState,
  SectionLabel,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useFloatingTabBarClearance } from '@/shared/presentation/components/GlassTabBar';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import { ChatLimitReachedError } from '../../domain';
import type { MovementDraft } from '../../domain/types/Assistant';
import { AssistantBubble } from '../components/AssistantBubble';
import { AssistantHeader } from '../components/AssistantHeader';
import { BlockView } from '../components/BlockView';
import { ChatInput } from '../components/ChatInput';
import { LimitGateCard } from '../components/LimitGateCard';
import { SuggestedChips } from '../components/SuggestedChips';
import { TypingIndicator } from '../components/TypingIndicator';
import { UsageMeter } from '../components/UsageMeter';
import { UserBubble } from '../components/UserBubble';
import { useAssistantUsage } from '../hooks/useAssistantUsage';
import {
  useConfirmDraft,
  useDiscardDraft,
  useSendMessage,
} from '../hooks/useAssistantMutations';
import { useChatHistory } from '../hooks/useChatHistory';

const CHIP_KEYS = ['month', 'topSpend', 'upcoming'] as const;

export function AssistantScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useMemo(() => toIsoDate(new Date()), []);

  const history = useChatHistory();
  const usage = useAssistantUsage(today);
  const send = useSendMessage(today);
  const confirm = useConfirmDraft(today);
  const discard = useDiscardDraft();
  const openSheet = useExpenseSheetStore((s) => s.openSheet);

  const [input, setInput] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const tabBarClearance = useFloatingTabBarClearance();

  const messages = history.data?.messages ?? [];
  const typing = send.isPending;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length, typing, limitHit]);

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
    (draft: MovementDraft) => {
      confirm.mutate(
        { draftId: draft.id },
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

  if (history.isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.bgBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  if (history.isError) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
        edges={['top']}
      >
        <RetryState
          titleKey="assistant.errors.title"
          retryKey="assistant.errors.retry"
          onRetry={() => void history.refetch()}
        />
      </SafeAreaView>
    );
  }

  const busyDraftId = confirm.isPending
    ? (confirm.variables?.draftId ?? null)
    : discard.isPending
      ? (discard.variables ?? null)
      : null;

  const messagesUsage = usage.data?.messages;
  const overLimit =
    messagesUsage !== undefined &&
    messagesUsage.used >= messagesUsage.limit + messagesUsage.grace;
  const inGrace =
    messagesUsage !== undefined &&
    !overLimit &&
    messagesUsage.used >= messagesUsage.limit;
  const gateVisible = limitHit || overLimit;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: 12,
            paddingHorizontal: 16,
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AssistantHeader onAvatarPress={() => router.push('/profile')} />

          <UsageMeter usage={usage.data} />

          {messages.length === 0 ? (
            <Card padding={16}>
              <Text variant="body" style={{ fontWeight: '500', marginBottom: 4 }}>
                {t('assistant.empty.title')}
              </Text>
              <Text variant="caption" muted>
                {t('assistant.empty.body')}
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 12, paddingTop: 4 }}>
              <SectionLabel>{t('assistant.conversation')}</SectionLabel>
              {messages.map((message) =>
                message.role === 'user' ? (
                  <UserBubble
                    key={message.id}
                    text={
                      message.blocks[0]?.type === 'text' ? message.blocks[0].text : ''
                    }
                  />
                ) : (
                  <AssistantBubble key={message.id}>
                    <View style={{ gap: 10 }}>
                      {message.blocks.map((block, index) => (
                        <BlockView
                          key={`${message.id}-${index}`}
                          block={block}
                          draftHandlers={{
                            onConfirm: onConfirmDraft,
                            onEdit: onEditDraft,
                            onDiscard: onDiscardDraft,
                            busyDraftId,
                          }}
                        />
                      ))}
                    </View>
                  </AssistantBubble>
                ),
              )}
              {typing ? <TypingIndicator /> : null}
            </View>
          )}

          {inGrace && !gateVisible ? (
            <Text variant="caption" muted style={{ textAlign: 'center' }}>
              {t('assistant.nudge', {
                left: messagesUsage.limit + messagesUsage.grace - messagesUsage.used,
              })}
            </Text>
          ) : null}
          {gateVisible ? <LimitGateCard onSeePlus={() => router.push('/plan')} /> : null}
        </ScrollView>

        <View
          style={{
            paddingTop: 8,
            paddingBottom: tabBarClearance,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.bgBase,
            borderTopColor: theme.colors.borderSubtle,
            borderTopWidth: 1,
          }}
        >
          <SuggestedChips
            chips={CHIP_KEYS.map((key) => ({
              id: key,
              label: t(`assistant.chips.${key}`),
            }))}
            disabled={typing || gateVisible}
            onPick={(chip) => sendMessage(chip.label)}
          />
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={() => sendMessage(input)}
            disabled={typing || gateVisible}
          />
        </View>
      </KeyboardAvoidingView>

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
      />
    </SafeAreaView>
  );
}

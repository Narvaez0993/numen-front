import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type {
  ChatMessage,
  CannedResponseId,
  Insight,
  SuggestedChip,
} from '../../domain/types/Assistant';
import { AssistantBubble } from '../components/AssistantBubble';
import { AssistantHeader } from '../components/AssistantHeader';
import { CannedResponse } from '../components/CannedResponse';
import { ChatInput } from '../components/ChatInput';
import { FormattedText } from '../components/FormattedText';
import { InsightCard } from '../components/InsightCard';
import { SuggestedChips } from '../components/SuggestedChips';
import { TypingIndicator } from '../components/TypingIndicator';
import { UserBubble } from '../components/UserBubble';
import { useAssistant } from '../hooks/useAssistant';
import { matchCanned } from '../utils/matchCanned';

const INSIGHT_TO_QUERY: Record<string, string> = {
  'alerta-cafe': '¿Cómo voy en café?',
  'patron-viernes': 'Gastos del fin de semana',
  'subs-total': 'Mis suscripciones',
  'accion-clasificar': 'Revisemos los gastos sin clasificar',
};

export function AssistantScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useAssistant();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, typing]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || typing) return;
      setInput('');
      const userMsg: ChatMessage = {
        id: Date.now(),
        role: 'user',
        text,
      };
      setMessages((m) => [...m, userMsg]);
      setTyping(true);

      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

      const cannedId: CannedResponseId = matchCanned(text) ?? 'honest';
      const response: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        cannedId,
      };
      setTyping(false);
      setMessages((m) => [...m, response]);
    },
    [typing],
  );

  const onInsightCta = useCallback(
    (insight: Insight) => {
      const q = INSIGHT_TO_QUERY[insight.id] ?? insight.cta;
      setDismissed((d) => new Set([...d, insight.id]));
      void sendMessage(q);
    },
    [sendMessage],
  );

  const onChipPick = useCallback(
    (chip: SuggestedChip) => {
      void sendMessage(chip.label);
    },
    [sendMessage],
  );

  if (isLoading || !data) {
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

  const visibleInsights = data.insights.filter((i) => !dismissed.has(i.id));
  const showInsights = visibleInsights.length > 0 && messages.length < 2;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

          {showInsights ? (
            <View style={{ gap: 10 }}>
              <SectionLabel>
                {messages.length === 0
                  ? t('assistant.thisWeek')
                  : t('assistant.suggestions')}
              </SectionLabel>
              {visibleInsights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} onCtaPress={onInsightCta} />
              ))}
            </View>
          ) : null}

          {messages.length > 0 ? (
            <View style={{ gap: 12, paddingTop: 4 }}>
              <SectionLabel>{t('assistant.conversation')}</SectionLabel>
              {messages.map((m) =>
                m.role === 'user' ? (
                  <UserBubble key={m.id} text={m.text} />
                ) : m.cannedId !== undefined ? (
                  <AssistantBubble key={m.id}>
                    <CannedResponse id={m.cannedId} />
                  </AssistantBubble>
                ) : (
                  <AssistantBubble key={m.id}>
                    <FormattedText text={m.text} />
                  </AssistantBubble>
                ),
              )}
              {typing ? <TypingIndicator /> : null}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            paddingTop: 8,
            paddingBottom: 12,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.bgBase,
            borderTopColor: theme.colors.borderSubtle,
            borderTopWidth: 1,
          }}
        >
          <SuggestedChips
            chips={data.suggestedChips}
            disabled={typing}
            onPick={onChipPick}
          />
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={() => void sendMessage(input)}
            disabled={typing}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

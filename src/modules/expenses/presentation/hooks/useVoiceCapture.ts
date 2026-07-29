/**
 * The capture sheet's conductor: microphone in, a staged draft (or one honest
 * question) out. The store's `flow` IS the state machine — this hook only
 * moves it, driven by the recognizer's `end` event and the parse's outcome.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RegistrationLimitReachedError } from '@/modules/assistant/domain';
import type { CaptureSource } from '@/modules/assistant/domain/types/Assistant';
import { useParseCapture } from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { useSpeechRecognition } from '@/shared/presentation/voice/useSpeechRecognition';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

export function useVoiceCapture() {
  const { t } = useTranslation();
  const today = useMemo(() => toIsoDate(new Date()), []);
  const parse = useParseCapture(today);
  const catalogs = useMovementCatalogs();

  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const setMethod = useExpenseSheetStore((s) => s.setMethod);
  const setTranscript = useExpenseSheetStore((s) => s.setTranscript);
  const setDraft = useExpenseSheetStore((s) => s.setDraft);
  const setClarification = useExpenseSheetStore((s) => s.setClarification);
  const setNotice = useExpenseSheetStore((s) => s.setNotice);

  const [inlineError, setInlineError] = useState<string | null>(null);

  // Account and category names bias the recognizer toward the words that
  // actually matter in this app ("Nequi" beats "net key").
  const contextualStrings = useMemo(
    () => [
      ...Object.values(catalogs.sourceById).map((source) => source.name),
      ...Object.values(catalogs.categoryById).map((category) => category.name),
    ],
    [catalogs],
  );

  const submit = useCallback(
    (text: string, source: CaptureSource) => {
      setInlineError(null);
      setMethod(source === 'voice' ? 'voice' : 'text');
      setTranscript(source === 'voice' ? text : null);
      setFlow('processing');
      parse.mutate(
        { text, source },
        {
          onSuccess: (outcome) => {
            if (outcome.draft !== null) {
              setDraft(outcome.draft);
              setFlow('confirm');
              return;
            }
            setClarification(outcome.clarification);
            setFlow('writing');
          },
          onError: (error) => {
            if (error instanceof RegistrationLimitReachedError) {
              // The habit never hard-blocks: the manual form is always there.
              setNotice(t('expenses.sheet.quotaExhausted'));
              setFlow('manual');
              return;
            }
            setInlineError(t('expenses.sheet.parseFailed'));
            setFlow(source === 'voice' ? 'entry' : 'writing');
          },
        },
      );
    },
    [parse, setClarification, setDraft, setFlow, setMethod, setNotice, setTranscript, t],
  );

  const onFinal = useCallback(
    (transcript: string) => {
      // The sheet may have been closed mid-listen; the store already reset.
      if (!useExpenseSheetStore.getState().open) {
        return;
      }
      if (!transcript) {
        setInlineError(t('expenses.sheet.nothingHeard'));
        setFlow('entry');
        return;
      }
      submit(transcript, 'voice');
    },
    [setFlow, submit, t],
  );

  const speech = useSpeechRecognition({ onFinal, contextualStrings });

  const onMicPress = useCallback(() => {
    if (flow === 'recording') {
      speech.stop();
      return;
    }
    setInlineError(null);
    void speech.start().then((started) => {
      if (started) {
        setFlow('recording');
      }
    });
  }, [flow, speech, setFlow]);

  const submitText = useCallback((text: string) => submit(text.trim(), 'text'), [submit]);

  const abort = speech.abort;
  useEffect(() => {
    if (!open) {
      abort();
    }
  }, [open, abort]);

  return {
    liveTranscript: speech.transcript,
    permissionDenied: speech.permission === 'denied',
    speechError: speech.errorCode,
    inlineError,
    onMicPress,
    submitText,
    parsePending: parse.isPending,
  };
}

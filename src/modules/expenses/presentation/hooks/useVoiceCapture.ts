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
  const setDrafts = useExpenseSheetStore((s) => s.setDrafts);
  const setDebtDrafts = useExpenseSheetStore((s) => s.setDebtDrafts);
  const setClarification = useExpenseSheetStore((s) => s.setClarification);
  const setNotice = useExpenseSheetStore((s) => s.setNotice);

  const [inlineError, setInlineError] = useState<string | null>(null);
  /** What is in the capture bar. It lives here rather than in the bar so an
   *  example chip can fill it and a failed parse can leave it alone to be fixed. */
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);

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
            setNotice(outcome.notice);
            // One breath can hold both — "un café de 5 mil y le presté 50 a
            // Andrés" — so whatever came back travels together.
            //
            // Nothing saves itself any more. The design reads back what it
            // understood and waits for one Registrar, because the screen that
            // shows the cards is the same one that lets you fix them: saving
            // first would make every correction an edit of money that already
            // moved.
            if (outcome.drafts.length > 0 || outcome.debtDrafts.length > 0) {
              setText('');
              setDrafts(outcome.drafts);
              setDebtDrafts(outcome.debtDrafts);
              setFlow('confirm');
              return;
            }
            // Understood nothing: the question surfaces where the words are, and
            // the words stay put so there is something to correct rather than
            // retype from scratch.
            setInlineError(outcome.clarification);
            setClarification(outcome.clarification);
            setFlow('entry');
          },
          onError: (error) => {
            if (error instanceof RegistrationLimitReachedError) {
              // The habit never hard-blocks: the manual form is always there.
              setNotice(t('expenses.sheet.quotaExhausted'));
              setFlow('manual');
              return;
            }
            setInlineError(t('expenses.sheet.parseFailed'));
            setFlow('entry');
          },
        },
      );
    },
    [
      parse,
      setClarification,
      setDebtDrafts,
      setDrafts,
      setFlow,
      setMethod,
      setNotice,
      setTranscript,
      t,
    ],
  );

  const onFinal = useCallback(
    (transcript: string, errorCode: string | null) => {
      // The sheet may have been closed mid-listen; the store already reset.
      if (!useExpenseSheetStore.getState().open) {
        return;
      }
      if (!transcript) {
        // A hard recognizer error is not "you were quiet" — say the truth.
        setInlineError(
          errorCode !== null && errorCode !== 'no-speech'
            ? t('expenses.sheet.voiceUnavailable')
            : t('expenses.sheet.nothingHeard'),
        );
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
      // Warming up is not listening: stopping there would end a session that
      // never opened, and the tap would read as the app ignoring you.
      if (speech.status === 'starting') {
        return;
      }
      speech.stop();
      return;
    }
    setInlineError(null);
    void speech.start().then((started) => {
      if (started) {
        setFlow('recording');
        return;
      }
      // Denied permission renders its own rationale; anything else means the
      // recognizer itself is missing (simulators, mostly).
      if (speech.permission !== 'denied') {
        setInlineError(t('expenses.sheet.voiceUnavailable'));
      }
    });
  }, [flow, speech, setFlow, t]);

  const submitTyped = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    submit(trimmed, 'text');
  }, [submit, text]);

  /** Backing out of a recording: no words, no parse, nothing charged. */
  const onCancelRecording = useCallback(() => {
    speech.abort();
    setInlineError(null);
    setFlow('entry');
  }, [speech, setFlow]);

  /** "Mejor lo digo otra vez" — the cards go, the bar comes back empty. */
  const onRetry = useCallback(() => {
    setDrafts([]);
    setDebtDrafts([]);
    setNotice(null);
    setInlineError(null);
    setText('');
    setFlow('entry');
  }, [setDebtDrafts, setDrafts, setFlow, setNotice]);

  // The clock next to the wave. It runs off the flow rather than the recognizer
  // so it starts the moment the bar changes, not when the engine warms up.
  useEffect(() => {
    if (flow !== 'recording') {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - started) / 1000), 250);
    return () => clearInterval(id);
  }, [flow]);

  const abort = speech.abort;
  useEffect(() => {
    if (!open) {
      abort();
    }
  }, [open, abort]);

  return {
    text,
    setText,
    elapsed,
    submitTyped,
    onCancelRecording,
    onRetry,
    liveTranscript: speech.transcript,
    /** True only once the recognizer has really opened the mic. */
    listening: speech.status === 'listening',
    /** 0..1 input volume — the orb follows it. */
    level: speech.level,
    permissionDenied: speech.permission === 'denied',
    speechError: speech.errorCode,
    inlineError,
    onMicPress,
    parsePending: parse.isPending,
  };
}

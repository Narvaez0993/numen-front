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
  const setFreshIds = useExpenseSheetStore((s) => s.setFreshIds);

  const [inlineError, setInlineError] = useState<string | null>(null);
  /** What is in the capture bar. It lives here rather than in the bar so an
   *  example chip can fill it and a failed parse can leave it alone to be fixed. */
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  /** The sentence in flight, spoken or typed. It stays on screen while the agent
   *  reads it — sending should not blank the words you just said. */
  const [pending, setPending] = useState<string | null>(null);

  // Account and category names bias the recognizer toward the words that
  // actually matter in this app ("Nequi" beats "net key").
  const contextualStrings = useMemo(
    () => [
      ...Object.values(catalogs.sourceById).map((source) => source.name),
      ...Object.values(catalogs.categoryById).map((category) => category.name),
    ],
    [catalogs],
  );

  /** Whether anything is already on the confirm list — read live, because the
   *  parse's callback fires long after this render's props were captured. */
  const hasCards = useCallback(() => {
    const state = useExpenseSheetStore.getState();
    return state.drafts.length + state.debtDrafts.length > 0;
  }, []);

  const submit = useCallback(
    (text: string, source: CaptureSource) => {
      setInlineError(null);
      setPending(text);
      // The bar empties the moment it is sent: while it is being read the
      // sentence is already on screen at 27px, and printing it twice makes the
      // capture look like it did not take.
      setText('');
      setMethod(source === 'voice' ? 'voice' : 'text');
      // Adding to a capture already on screen extends the quote rather than
      // replacing it: "un café… ah, y un tinto" is one dictation to the person
      // saying it, and swapping the sentence would orphan the earlier cards.
      // Typed captures are quoted back too. They used to be left out because the
      // words were still in the bar — but the bar empties on send now, so
      // skipping the quote would lose them the moment they were understood.
      const previousPhrase = useExpenseSheetStore.getState().transcript;
      setTranscript(
        previousPhrase !== null && hasCards() ? `${previousPhrase} ${text}` : text,
      );
      setFlow('processing');
      parse.mutate(
        { text, source },
        {
          onSuccess: (outcome) => {
            setPending(null);
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
              // APPEND. Remembering something a beat later is the normal way
              // people list what they spent, and making them close the capture
              // and start over for it is the app being worse than a napkin.
              const current = useExpenseSheetStore.getState();
              const adding = current.drafts.length + current.debtDrafts.length > 0;
              setDrafts([...current.drafts, ...outcome.drafts]);
              setDebtDrafts([...current.debtDrafts, ...outcome.debtDrafts]);
              setFreshIds(
                adding
                  ? [
                      ...outcome.drafts.map((draft) => draft.id),
                      ...outcome.debtDrafts.map((draft) => draft.id),
                    ]
                  : [],
              );
              setFlow('confirm');
              return;
            }
            // Understood nothing: the question surfaces where the words are, and
            // the words stay put so there is something to correct rather than
            // retype from scratch.
            setInlineError(outcome.clarification);
            setClarification(outcome.clarification);
            if (source === 'text') {
              setText(text);
            }
            setFlow('entry');
          },
          onError: (error) => {
            setPending(null);
            // Nothing understood means the words are all the user has left —
            // hand them back rather than making them type it again.
            if (source === 'text') {
              setText(text);
            }
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
      hasCards,
      parse,
      setClarification,
      setFreshIds,
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
    setFreshIds([]);
    setTranscript(null);
    setNotice(null);
    setInlineError(null);
    setText('');
    setFlow('entry');
  }, [setDebtDrafts, setDrafts, setFlow, setFreshIds, setNotice, setTranscript]);

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
    pending,
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

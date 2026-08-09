/**
 * The capture sheet's conductor: microphone in, a staged draft (or one honest
 * question) out. The store's `flow` IS the state machine — this hook only
 * moves it, driven by the recognizer's `end` event and the parse's outcome.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RegistrationLimitReachedError } from '@/modules/assistant/domain';
import type {
  CapturedRecord,
  CaptureSource,
  DebtDraft,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';
import {
  useConfirmDebtDraft,
  useConfirmDraft,
  useParseCapture,
} from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { useSpeechRecognition } from '@/shared/presentation/voice/useSpeechRecognition';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';
import { needsAnswers } from '../utils/captureAnswers';

export function useVoiceCapture() {
  const { t } = useTranslation();
  const today = useMemo(() => toIsoDate(new Date()), []);
  const parse = useParseCapture(today);
  const confirmDraft = useConfirmDraft(today);
  const confirmDebtDraft = useConfirmDebtDraft(today);
  const catalogs = useMovementCatalogs();

  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const setMethod = useExpenseSheetStore((s) => s.setMethod);
  const setTranscript = useExpenseSheetStore((s) => s.setTranscript);
  const setDrafts = useExpenseSheetStore((s) => s.setDrafts);
  const setDebtDrafts = useExpenseSheetStore((s) => s.setDebtDrafts);
  const setSaved = useExpenseSheetStore((s) => s.setSaved);
  const closeSheet = useExpenseSheetStore((s) => s.closeSheet);
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

  /**
   * Everything the agent already knew, saved without asking.
   *
   * It walks the drafts one by one rather than firing them together, because each
   * confirm moves real money and a half-applied batch is worse than a slow one.
   * Anything that fails hands the REST back to the confirm screen, where the user
   * decides — silently dropping them would be the app losing words it heard.
   */
  const saveAll = useCallback(
    async (drafts: MovementDraft[], debtDrafts: DebtDraft[]) => {
      const records: CapturedRecord[] = [];
      const leftoverDrafts: MovementDraft[] = [];
      const leftoverDebts: DebtDraft[] = [];

      for (const draft of drafts) {
        try {
          const done = await confirmDraft.mutateAsync({ draftId: draft.id });
          records.push({ kind: 'movement', movementId: done.movementId });
        } catch {
          leftoverDrafts.push(draft);
        }
      }
      for (const draft of debtDrafts) {
        try {
          const done = await confirmDebtDraft.mutateAsync({ draftId: draft.id });
          records.push(
            done.movementId !== null
              ? {
                  kind: 'payment',
                  debtId: done.debtId,
                  movementId: done.movementId,
                }
              : { kind: 'debt', debtId: done.debtId },
          );
        } catch {
          leftoverDebts.push(draft);
        }
      }

      if (leftoverDrafts.length > 0 || leftoverDebts.length > 0) {
        setDrafts(leftoverDrafts);
        setDebtDrafts(leftoverDebts);
        setSaved(records);
        setFlow('confirm');
        return;
      }
      setSaved(records);
      closeSheet();
    },
    [
      confirmDebtDraft,
      confirmDraft,
      closeSheet,
      setDebtDrafts,
      setDrafts,
      setFlow,
      setSaved,
    ],
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
            if (outcome.drafts.length > 0 || outcome.debtDrafts.length > 0) {
              // Nothing left to ask: save it and get out of the way. Being asked
              // is what deserves a screen; being understood does not.
              //
              // Losing part of what was said does, though. Saving two of three and
              // closing would show a toast for the two and never mention the third
              // — silence that reads as "it all went in".
              if (
                outcome.notice === null &&
                !needsAnswers(outcome.drafts, outcome.debtDrafts)
              ) {
                void saveAll(outcome.drafts, outcome.debtDrafts);
                return;
              }
              setDrafts(outcome.drafts);
              setDebtDrafts(outcome.debtDrafts);
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
    [
      parse,
      saveAll,
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

  const submitText = useCallback((text: string) => submit(text.trim(), 'text'), [submit]);

  const abort = speech.abort;
  useEffect(() => {
    if (!open) {
      abort();
    }
  }, [open, abort]);

  return {
    liveTranscript: speech.transcript,
    /** True only once the recognizer has really opened the mic. */
    listening: speech.status === 'listening',
    /** 0..1 input volume — the orb follows it. */
    level: speech.level,
    permissionDenied: speech.permission === 'denied',
    speechError: speech.errorCode,
    inlineError,
    onMicPress,
    submitText,
    parsePending: parse.isPending,
  };
}

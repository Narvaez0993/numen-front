/**
 * The one seam between Deshka and the device's speech recognizer.
 *
 * Generic on purpose: the capture sheet consumes it today, the onboarding's
 * Magic Moment will tomorrow — swapping the underlying library means rewriting
 * this file and nothing else.
 *
 * Three facts of the platform drive the shape:
 * - We listen in CONTINUOUS mode, so a pause mid-sentence no longer ends the
 *   capture. People list several expenses in one breath ("10 en café, 5 en
 *   papitas") and the gaps between them are thinking, not finishing. The user
 *   decides when they are done by tapping; `MAX_SESSION_MS` is only a backstop
 *   for a mic left open by accident.
 * - Continuous mode on Android is SEGMENTED: every final result covers new
 *   words rather than the whole session, so finals must be concatenated. iOS
 *   sends one cumulative final instead — joining handles both.
 * - Permissions are requested lazily on the first `start()`, never on mount.
 */

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getLocales } from 'expo-localization';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  appLanguageKey,
  resolveRecognitionLocale,
  RETRY_LOCALE,
} from './recognitionLocale';
import { absorb, NO_SEGMENTS, type SegmentState } from './transcriptSegments';

export type SpeechStatus = 'idle' | 'listening' | 'stopping';
export type SpeechPermission = 'unknown' | 'granted' | 'denied';

/** Nothing anyone dictates to a capture sheet runs a full minute; past this the
 * mic was left open by accident, and an open mic is a battery bill. */
const MAX_SESSION_MS = 60_000;

type Options = {
  /** Fired on the `end` event with the final transcript ('' when nothing was
   * heard) and the error that ended the session, if any. */
  onFinal: (transcript: string, errorCode: string | null) => void;
  /** Vocabulary to bias toward — account and category names hear better. */
  contextualStrings?: string[];
};

export function useSpeechRecognition({ onFinal, contextualStrings }: Options) {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [permission, setPermission] = useState<SpeechPermission>('unknown');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  /** Committed segments plus the live tail — see `transcriptSegments`. */
  const segmentsRef = useRef<SegmentState>(NO_SEGMENTS);
  const errorRef = useRef<string | null>(null);
  const retriedLocaleRef = useRef(false);
  const restartingRef = useRef(false);
  const deadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const clearDeadline = useCallback(() => {
    if (deadlineRef.current !== null) {
      clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  }, []);

  const beginSession = useCallback(
    (lang: string) => {
      setErrorCode(null);
      errorRef.current = null;
      setTranscript('');
      segmentsRef.current = NO_SEGMENTS;
      setStatus('listening');
      clearDeadline();
      deadlineRef.current = setTimeout(() => {
        ExpoSpeechRecognitionModule.stop();
      }, MAX_SESSION_MS);
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        // Silence is a pause, not a period: the user taps to say they are done.
        continuous: true,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        iosTaskHint: 'dictation',
        contextualStrings,
      });
    },
    [clearDeadline, contextualStrings],
  );

  useSpeechRecognitionEvent('result', (event) => {
    segmentsRef.current = absorb(
      segmentsRef.current,
      event.results[0]?.transcript ?? '',
      event.isFinal,
    );
    setTranscript(segmentsRef.current.transcript);
  });

  useSpeechRecognitionEvent('error', (event) => {
    // Surfacing beats guessing: simulators and odd devices fail in ways only
    // the code tells apart (docs/09: iOS simulator STT is known-broken).
    console.warn(`[voice] recognition error: ${event.error} — ${event.message}`);
    // One silent second chance when the first tag is rejected; every other
    // error surfaces and lets the caller offer typing instead.
    if (event.error === 'language-not-supported' && !retriedLocaleRef.current) {
      retriedLocaleRef.current = true;
      restartingRef.current = true;
      return;
    }
    errorRef.current = event.error;
    setErrorCode(event.error);
  });

  useSpeechRecognitionEvent('end', () => {
    if (restartingRef.current) {
      restartingRef.current = false;
      beginSession(RETRY_LOCALE[appLanguageKey(i18n.language)]);
      return;
    }
    clearDeadline();
    setStatus('idle');
    onFinalRef.current(segmentsRef.current.transcript.trim(), errorRef.current);
  });

  const start = useCallback(async (): Promise<boolean> => {
    // Simulators (and rare devices) have no recognizer at all — say so instead
    // of starting a session that dies instantly and reads as a silent reset.
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      console.warn('[voice] speech recognition unavailable on this device/simulator');
      setErrorCode('recognizer-unavailable');
      return false;
    }
    const granted = await ensurePermission(setPermission);
    if (!granted) {
      return false;
    }
    beginSession(
      resolveRecognitionLocale(
        i18n.language,
        getLocales()
          .map((locale) => locale.languageTag)
          .filter((tag): tag is string => typeof tag === 'string'),
      ),
    );
    return true;
  }, [beginSession, i18n.language]);

  const stop = useCallback(() => {
    setStatus('stopping');
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const abort = useCallback(() => {
    restartingRef.current = false;
    segmentsRef.current = NO_SEGMENTS;
    clearDeadline();
    ExpoSpeechRecognitionModule.abort();
    setStatus('idle');
    setTranscript('');
  }, [clearDeadline]);

  return { status, transcript, permission, errorCode, start, stop, abort };
}

async function ensurePermission(
  setPermission: (value: SpeechPermission) => void,
): Promise<boolean> {
  const current = await ExpoSpeechRecognitionModule.getPermissionsAsync();
  if (current.granted) {
    setPermission('granted');
    return true;
  }
  const requested = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  setPermission(requested.granted ? 'granted' : 'denied');
  return requested.granted;
}

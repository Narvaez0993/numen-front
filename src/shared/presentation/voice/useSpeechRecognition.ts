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
 * - `start()` resolving is NOT the mic being open. The engine warms up after
 *   it, and on Android the gap is long enough that people talk into a mic that
 *   is not listening yet and lose their first words. The native `start` event is
 *   the real go signal, which is why `status` has a `starting` step of its own.
 * - The recognizer reports input volume, and the UI uses it to show that the app
 *   is hearing THEM rather than merely being on. It is off by default; asking for
 *   it every 100ms is what makes an orb react to a voice.
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

export type SpeechStatus = 'idle' | 'starting' | 'listening' | 'stopping';
export type SpeechPermission = 'unknown' | 'granted' | 'denied';

/** Nothing anyone dictates to a capture sheet runs a full minute; past this the
 * mic was left open by accident, and an open mic is a battery bill. */
const MAX_SESSION_MS = 60_000;

/** How often the recognizer reports input volume. 100ms is its own default on
 *  iOS and reads as continuous to the eye; faster only costs battery. */
const VOLUME_INTERVAL_MS = 100;

/** `volumechange` reports −2 (silence) to 10 (shouting). Normal speech sits low
 *  in that range, so the ceiling is well under 10 — dividing by the full range
 *  would make an ordinary voice look like a whisper. */
const VOLUME_CEILING = 5;

function toLevel(value: number): number {
  if (value <= 0) return 0;
  return Math.min(value / VOLUME_CEILING, 1);
}

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
  /** 0..1, how loud the mic is hearing right now. Drives the listening orb. */
  const [level, setLevel] = useState(0);
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
      setLevel(0);
      setStatus('starting');
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
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: VOLUME_INTERVAL_MS,
        },
      });
    },
    [clearDeadline, contextualStrings],
  );

  // The mic is open for real. Until this lands the user must not be told to
  // speak — that is the gap where first words go missing.
  useSpeechRecognitionEvent('start', () => {
    setStatus((current) => (current === 'starting' ? 'listening' : current));
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    setLevel(toLevel(event.value));
  });

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
    setLevel(0);
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
    setLevel(0);
    setTranscript('');
  }, [clearDeadline]);

  return { status, level, transcript, permission, errorCode, start, stop, abort };
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

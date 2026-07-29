/**
 * The one seam between Deshka and the device's speech recognizer.
 *
 * Generic on purpose: the capture sheet consumes it today, the onboarding's
 * Magic Moment will tomorrow — swapping the underlying library means rewriting
 * this file and nothing else.
 *
 * Two facts of the platform drive the shape:
 * - iOS ends recognition on its own after ~3 s of silence, so the `end` event
 *   is the ONLY source of truth for "finished" — tapping stop just asks.
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

export type SpeechStatus = 'idle' | 'listening' | 'stopping';
export type SpeechPermission = 'unknown' | 'granted' | 'denied';

type Options = {
  /** Fired on the `end` event with the final transcript ('' when nothing was heard). */
  onFinal: (transcript: string) => void;
  /** Vocabulary to bias toward — account and category names hear better. */
  contextualStrings?: string[];
};

export function useSpeechRecognition({ onFinal, contextualStrings }: Options) {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [permission, setPermission] = useState<SpeechPermission>('unknown');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const transcriptRef = useRef('');
  const retriedLocaleRef = useRef(false);
  const restartingRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const beginSession = useCallback(
    (lang: string) => {
      setErrorCode(null);
      setTranscript('');
      transcriptRef.current = '';
      setStatus('listening');
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        iosTaskHint: 'dictation',
        contextualStrings,
      });
    },
    [contextualStrings],
  );

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setTranscript(text);
  });

  useSpeechRecognitionEvent('error', (event) => {
    // One silent second chance when the first tag is rejected; every other
    // error surfaces and lets the caller offer typing instead.
    if (event.error === 'language-not-supported' && !retriedLocaleRef.current) {
      retriedLocaleRef.current = true;
      restartingRef.current = true;
      return;
    }
    setErrorCode(event.error);
  });

  useSpeechRecognitionEvent('end', () => {
    if (restartingRef.current) {
      restartingRef.current = false;
      beginSession(RETRY_LOCALE[appLanguageKey(i18n.language)]);
      return;
    }
    setStatus('idle');
    onFinalRef.current(transcriptRef.current.trim());
  });

  const start = useCallback(async (): Promise<boolean> => {
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
    transcriptRef.current = '';
    ExpoSpeechRecognitionModule.abort();
    setStatus('idle');
    setTranscript('');
  }, []);

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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, TextInput, useWindowDimensions, View } from 'react-native';
import { useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Account } from '@/modules/accounts/domain';
import type { MovementDraft } from '@/modules/assistant/domain/types/Assistant';
import {
  useConfirmDraft,
  useParseCapture,
} from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { CurrencyCode } from '@/shared/domain';
import { Icon, InkButton, Orb, RiseIn, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { capitalized, dayLabel, toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';
import { useSpeechRecognition } from '@/shared/presentation/voice/useSpeechRecognition';

import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { RecordedCard } from '../components/RecordedCard';
import { WelcomeOrb } from '../components/WelcomeOrb';

export type MagicStage =
  | 'ready'
  | 'listening'
  | 'thinking'
  | 'saved'
  | 'unclear'
  | 'typing';

type Props = {
  /** Where the first expense lands — the account created one step before. */
  account: Account;
  onDone: () => void;
};

/**
 * «Lo último: cuéntame algo que hayas gastado hoy.» — the moment the welcome
 * promised, for real this time: it listens, it understands, and it saves.
 *
 * The design's three screens are one here, in stages: «Lo último» (the orb is
 * the button), «Te escucho» (the words land as they are heard) and «Ya quedó»
 * (the card of what was recorded, with the category, account and day the app
 * chose). It used to be a simulation that always «heard» a $3.500 coffee and
 * saved nothing, which is why the first Home was empty.
 *
 * Where speaking cannot work — no recognizer (simulators), the microphone
 * refused — it offers to write it instead of failing; and «Después» is always
 * there, because a first expense is an invitation, not a gate.
 *
 * Cheap while listening: the recognizer's level re-renders this screen ten
 * times a second, and the orb hears it through a shared value, so it never
 * re-renders (see `WelcomeOrb`).
 */
export function MagicStep({ account, onDone }: Props) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const compact = height < 820;
  const still = useReducedMotion();
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  const today = useMemo(() => toIsoDate(new Date()), []);
  const parse = useParseCapture(today);
  const confirm = useConfirmDraft(today);
  const categories = useCategories();

  const [stage, setStage] = useState<MagicStage>('ready');
  const [phrase, setPhrase] = useState('');
  const [saved, setSaved] = useState<MovementDraft[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [micMissing, setMicMissing] = useState(false);
  const cancelled = useRef(false);

  const talk = useSharedValue(0);
  const burst = useSharedValue(1);

  const understand = useCallback(
    async (text: string, source: 'voice' | 'text') => {
      setPhrase(text);
      setProblem(null);
      setStage('thinking');
      try {
        const outcome = await parse.mutateAsync({ text, source });
        const drafts = outcome.drafts.filter((draft) => draft.status === 'pending');
        if (drafts.length === 0) {
          setProblem(outcome.clarification);
          setStage('unclear');
          return;
        }
        const recorded: MovementDraft[] = [];
        for (const draft of drafts) {
          // With one account the agent already puts it there; the override is
          // for when it did not say, so nothing is left without a home.
          const result = await confirm.mutateAsync({
            draftId: draft.id,
            overrides: draft.sourceId
              ? undefined
              : { sourceType: 'account', sourceId: account.id },
          });
          recorded.push(result.draft);
        }
        setSaved(recorded);
        setStage('saved');
      } catch {
        setProblem(t('onboarding.magic.failed'));
        setStage('unclear');
      }
    },
    [parse, confirm, account.id, t],
  );

  const onFinal = useCallback(
    (transcript: string, errorCode: string | null) => {
      if (cancelled.current) {
        cancelled.current = false;
        return;
      }
      if (transcript) {
        void understand(transcript, 'voice');
        return;
      }
      setProblem(
        t(errorCode ? 'onboarding.magic.micError' : 'onboarding.magic.nothingHeard'),
      );
      setStage('unclear');
    },
    [understand, t],
  );

  const contextualStrings = useMemo(
    () => [account.name, ...(categories.data ?? []).map((category) => category.name)],
    [account.name, categories.data],
  );
  const speech = useSpeechRecognition({ onFinal, contextualStrings });

  // The voice drives the orb's bars — on the UI thread, never through a render.
  const hearing = stage === 'listening' && speech.status === 'listening';
  useEffect(() => {
    talk.value = withTiming(hearing ? 0.25 + 0.75 * Math.min(1, speech.level * 1.6) : 0, {
      duration: 120,
    });
  }, [hearing, speech.level, talk]);

  const listen = async () => {
    cancelled.current = false;
    setProblem(null);
    setStage('listening');
    const started = await speech.start();
    if (!started) {
      setMicMissing(true);
      setStage('typing');
    }
  };

  const stopCapture = () => {
    if (stage === 'listening') {
      cancelled.current = true;
      speech.abort();
    }
  };

  const later = () => {
    stopCapture();
    onDone();
  };

  const categoryName = (id: string | null) =>
    (categories.data ?? []).find((category) => category.id === id)?.name ?? null;

  if (stage === 'saved' && saved[0]) {
    const first = saved[0];
    const sign = first.type === 'income' ? '+' : first.type === 'expense' ? '−' : '';
    return (
      <OnbFrame scroll>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 11,
            paddingHorizontal: 26,
            paddingTop: 18,
          }}
        >
          <Orb size={34} glass={false} />
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, letterSpacing: 2.6, textTransform: 'uppercase' }}
          >
            deshka
          </Text>
        </View>

        <View style={{ paddingHorizontal: 28, paddingTop: 30 }}>
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 14, lineHeight: 21, marginBottom: 20 }}
          >
            «{phrase}»
          </Text>
        </View>
        <OnbHeadline size={31} paddingTop={0} i18nKey="onboarding.magic.savedTitle" />

        <View style={{ paddingHorizontal: 22, paddingTop: 26, gap: 10 }}>
          <RiseIn duration={still ? 0 : 380}>
            <RecordedCard
              title={first.description}
              amount={`${sign}${formatMoney(first.amount, first.currency as CurrencyCode)}`}
              income={first.type === 'income'}
              compact={compact}
              chips={[
                categoryName(first.categoryId),
                account.name,
                capitalized(
                  dayLabel(first.occurredOn, today, language, {
                    today: t('movements.days.today'),
                    yesterday: t('movements.days.yesterday'),
                  }),
                ),
              ].filter((chip): chip is string => chip !== null)}
            />
          </RiseIn>
          {saved.length > 1 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 12.5, paddingLeft: 6 }}
            >
              {t('onboarding.magic.more', { count: saved.length - 1 })}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 28, paddingTop: 24 }}>
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 14.5, lineHeight: 23 }}
          >
            <Trans
              i18nKey="onboarding.magic.savedBody"
              components={{ b: <Text style={{ fontSize: 14.5 }} /> }}
            />
          </Text>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />
        <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
          <InkButton
            label={t('onboarding.magic.continue')}
            onPress={onDone}
            height={56}
          />
        </View>
      </OnbFrame>
    );
  }

  if (stage === 'listening' || stage === 'thinking') {
    const thinking = stage === 'thinking';
    const words = thinking ? phrase : speech.transcript;
    return (
      <OnbFrame>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => {
              stopCapture();
              setStage('ready');
            }}
            disabled={thinking}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: thinking ? 0 : pressed ? 0.7 : 1,
            })}
          >
            <Icon
              name="arrow-left"
              size={17}
              stroke={2}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={{ height: compact ? 0 : 26 }} />
        <WelcomeOrb talk={talk} burst={burst} compact={compact} still={still} />

        <View style={{ paddingHorizontal: 30, paddingTop: compact ? 22 : 40 }}>
          <Text
            color={theme.colors.textTertiary}
            style={{
              fontSize: 10.5,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            {t(
              thinking
                ? 'onboarding.magic.thinking'
                : hearing
                  ? 'onboarding.magic.listening'
                  : 'onboarding.magic.starting',
            )}
          </Text>
          <Text
            style={{
              fontSize: compact ? 24 : 27,
              lineHeight: Math.round((compact ? 24 : 27) * 1.3),
              fontWeight: '300',
              letterSpacing: -0.8,
            }}
          >
            {words}
            {thinking ? null : (
              <Text color={theme.palette.acc2} style={{ fontWeight: '300' }}>
                |
              </Text>
            )}
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
          <InkButton
            label={t('onboarding.magic.done')}
            onPress={() => speech.stop()}
            disabled={!hearing}
            loading={thinking}
            height={56}
          />
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, textAlign: 'center', marginTop: 14 }}
          >
            {t('onboarding.magic.hint')}
          </Text>
        </View>
      </OnbFrame>
    );
  }

  if (stage === 'typing') {
    const ready = typed.trim().length >= 3;
    return (
      <OnbFrame scroll>
        <TopRow
          onBack={() => setStage('ready')}
          onLater={later}
          backLabel={t('common.back')}
          laterLabel={t('onboarding.magic.later')}
        />
        <OnbHeadline
          size={31}
          paddingTop={30}
          i18nKey="onboarding.magic.typeTitle"
          body={t(
            micMissing ? 'onboarding.magic.typeBodyNoMic' : 'onboarding.magic.typeBody',
          )}
        />
        <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            autoFocus
            multiline
            maxLength={200}
            placeholder={t('onboarding.magic.typePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            selectionColor={theme.palette.acc2}
            accessibilityLabel={t('onboarding.magic.typePlaceholder')}
            style={{
              minHeight: 96,
              paddingHorizontal: 18,
              paddingTop: 16,
              paddingBottom: 16,
              borderRadius: 20,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: withAlpha(theme.palette.acc, 0.34),
              fontSize: 19,
              lineHeight: 26,
              fontFamily: 'Geist_300Light',
              color: theme.colors.textPrimary,
              textAlignVertical: 'top',
            }}
          />
        </View>
        <View style={{ flex: 1, minHeight: 24 }} />
        <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
          <InkButton
            label={t('onboarding.magic.typeSubmit')}
            onPress={() => void understand(typed.trim(), 'text')}
            disabled={!ready}
            height={56}
          />
        </View>
      </OnbFrame>
    );
  }

  // «Lo último», and «no te entendí» — the same screen asking again.
  const unclear = stage === 'unclear';
  return (
    <OnbFrame>
      <View
        style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 26, paddingTop: 12 }}
      >
        {[0, 1, 2, 3].map((segment) => (
          <View
            key={segment}
            style={{
              flex: 1,
              height: 2.5,
              borderRadius: 2,
              backgroundColor:
                segment < 3
                  ? theme.colors.textPrimary
                  : withAlpha(theme.colors.textPrimary, 0.22),
            }}
          />
        ))}
      </View>
      <TopRow onLater={later} laterLabel={t('onboarding.magic.later')} />

      <View style={{ paddingHorizontal: 32, paddingTop: compact ? 8 : 26 }}>
        <Text
          color={theme.colors.textTertiary}
          style={{
            fontSize: 10.5,
            letterSpacing: 2.4,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          {t('onboarding.magic.label')}
        </Text>
        <Text
          style={{ fontSize: 31, lineHeight: 38, fontWeight: '300', letterSpacing: -1 }}
        >
          {unclear
            ? (problem ?? t('onboarding.magic.unclearTitle'))
            : t('onboarding.magic.title')}
        </Text>
        <Text
          color={theme.colors.textSecondary}
          style={{ fontSize: 14, lineHeight: 22, marginTop: 18 }}
        >
          {t(unclear ? 'onboarding.magic.unclearBody' : 'onboarding.magic.body')}
        </Text>
      </View>

      {unclear ? null : (
        <View style={{ paddingHorizontal: 30, paddingTop: compact ? 20 : 30, gap: 9 }}>
          {(t('onboarding.magic.examples', { returnObjects: true }) as string[]).map(
            (line) => (
              <Text key={line} color={theme.colors.textTertiary} style={{ fontSize: 13 }}>
                {line}
              </Text>
            ),
          )}
        </View>
      )}

      <View style={{ flex: 1 }} />

      <View style={{ alignItems: 'center', paddingBottom: compact ? 8 : 24 }}>
        {/* The orb and its words are one button: either is where a thumb
            goes to start talking. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.magic.tap')}
          onPress={() => void listen()}
          style={{ alignItems: 'center' }}
        >
          <WelcomeOrb talk={talk} burst={burst} compact still={still} glyph="mic" />
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5, marginTop: 4 }}
          >
            {t('onboarding.magic.tap')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setStage('typing')}
          hitSlop={8}
          style={({ pressed }) => ({
            minHeight: 44,
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text color={theme.palette.acc3} style={{ fontSize: 12.5, fontWeight: '500' }}>
            {t('onboarding.magic.orType')}
          </Text>
        </Pressable>
      </View>
    </OnbFrame>
  );
}

/** «Después» on the right, and a way back on the left where there is one. */
function TopRow({
  onLater,
  laterLabel,
  onBack,
  backLabel,
}: {
  onLater: () => void;
  laterLabel: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon
            name="arrow-left"
            size={17}
            stroke={2}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      ) : (
        <View />
      )}
      <Pressable
        accessibilityRole="button"
        onPress={onLater}
        style={({ pressed }) => ({
          minHeight: 44,
          justifyContent: 'center',
          paddingHorizontal: 14,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
          {laterLabel}
        </Text>
      </Pressable>
    </View>
  );
}

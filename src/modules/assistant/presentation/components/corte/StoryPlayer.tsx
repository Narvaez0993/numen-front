import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';

import type { ReactNode } from 'react';

import type { AgentOutput, AgentPlay } from '../../../domain/types/AgentFeed';
import { createPressController } from '../../utils/pressGesture';
import { SlideView } from './SlideView';
import { StoryProgressBar } from './StoryProgressBar';

const SLIDE_MS = 6000;

type Props = {
  corte: AgentOutput;
  onClose: () => void;
  onOpenFlat: () => void;
  playAction?: (play: AgentPlay) => ReactNode;
};

/**
 * The stories machine. One `Animated.Value` is the current slide's clock:
 * pausing freezes it via `stopAnimation`, resuming relaunches the REMAINING
 * duration. `stopAnimation` is async — a resume requested before its callback
 * lands is remembered and resolved inside the callback, which is the race the
 * refs below exist for. The last slide fills its bar and waits for the X.
 */
export function StoryPlayer({ corte, onClose, onOpenFlat, playAction }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const slides = corte.slides;
  const [index, setIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const stopping = useRef(false);
  const pendingResume = useRef(false);
  const indexRef = useRef(0);
  indexRef.current = index;

  const start = useCallback(
    (fromFraction: number) => {
      progress.setValue(fromFraction);
      Animated.timing(progress, {
        toValue: 1,
        duration: SLIDE_MS * (1 - fromFraction),
        easing: Easing.linear,
        // The bar animates width — layout, so the native driver stays off.
        useNativeDriver: false,
      }).start(({ finished }) => {
        // `finished` distinguishes the clock running out from a pause/jump.
        if (finished && indexRef.current < slides.length - 1) {
          setIndex(indexRef.current + 1);
        }
      });
    },
    [progress, slides.length],
  );

  useEffect(() => {
    start(0);
  }, [index, start]);

  const pause = useCallback(() => {
    stopping.current = true;
    progress.stopAnimation((value) => {
      stopping.current = false;
      if (pendingResume.current) {
        pendingResume.current = false;
        start(value);
      } else {
        progress.setValue(value);
      }
    });
  }, [progress, start]);

  const resume = useCallback(() => {
    if (stopping.current) {
      // The stop callback has not landed yet — let it do the relaunching.
      pendingResume.current = true;
      return;
    }
    progress.stopAnimation((value) => start(value));
  }, [progress, start]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= slides.length) return;
      setIndex(next);
    },
    [slides.length],
  );

  const controller = useMemo(
    () =>
      createPressController({
        onHoldStart: pause,
        onHoldEnd: resume,
        onTap: (zone) => goTo(indexRef.current + (zone === 'back' ? -1 : 1)),
      }),
    [pause, resume, goTo],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }}>
      <Pressable
        style={{ flex: 1 }}
        onPressIn={(event) => controller.pressIn(event.nativeEvent.locationX / width)}
        onPressOut={() => controller.pressOut()}
      >
        <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <StoryProgressBar count={slides.length} index={index} progress={progress} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                variant="label"
                color={theme.colors.textSecondary}
                style={{ textTransform: 'capitalize' }}
              >
                {monthName(`${corte.period}-01`, i18n.language)}{' '}
                {corte.period.slice(0, 4)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 18 }}>
                <Pressable accessibilityRole="button" onPress={onOpenFlat} hitSlop={10}>
                  <Icon
                    name="list-details"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
                  <Icon name="x" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>

          {slides[index] ? (
            <SlideView slide={slides[index]} corte={corte} playAction={playAction} />
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <View style={{ paddingBottom: insets.bottom + 14, alignItems: 'center' }}>
            <Text variant="caption" color={theme.colors.textTertiary}>
              {t('assistant.corte.playerHint')}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

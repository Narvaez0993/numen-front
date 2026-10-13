import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Segment = { text: string; bold: boolean };

/** «Hola.\nSoy <b>Deshka</b>.» → its lines, each a list of plain and bold runs. */
export function parseGreeting(source: string): Segment[][] {
  return source.split('\n').map((line) =>
    line
      .split(/(<b>.*?<\/b>)/)
      .filter(Boolean)
      .map((part) =>
        part.startsWith('<b>')
          ? { text: part.slice(3, -4), bold: true }
          : { text: part, bold: false },
      ),
  );
}

/** Before the first letter: the screen settles first. */
const START_MS = 350;
const CHAR_MS = 48;
/** A breath between the lines, the way someone pauses before saying their name. */
const LINE_PAUSE_MS = 320;

type Props = {
  i18nKey: string;
  size: number;
  /** Once the last letter is down — the cue for the demo to start. */
  onDone: () => void;
  /** Reduce Motion: the whole greeting at once. */
  still?: boolean;
};

/**
 * «Hola. Soy Deshka.», typed out as if the orb were saying it.
 *
 * One letter per step on a timer — sixteen small renders of this text alone,
 * memoised so nothing around it renders with it. The block keeps its full
 * height from the first frame, so nothing below moves as the letters arrive.
 */
export const TypedGreeting = memo(function TypedGreeting({
  i18nKey,
  size,
  onDone,
  still = false,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const source = t(i18nKey);
  const lines = useMemo(() => parseGreeting(source), [source]);
  const lengths = lines.map((line) =>
    line.reduce((sum, seg) => sum + seg.text.length, 0),
  );
  const total = lengths.reduce((sum, n) => sum + n, 0);
  const firstLine = lengths[0] ?? 0;
  const [shown, setShown] = useState(still ? total : 0);

  useEffect(() => {
    if (shown >= total) {
      onDone();
      return undefined;
    }
    if (still) {
      setShown(total);
      return undefined;
    }
    const delay = shown === 0 ? START_MS : shown === firstLine ? LINE_PAUSE_MS : CHAR_MS;
    const id = setTimeout(() => setShown((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [shown, total, firstLine, still, onDone]);

  const lineHeight = Math.round(size * 1.2);
  let budget = shown;
  let before = 0;

  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel={lines
        .map((line) => line.map((seg) => seg.text).join(''))
        .join(' ')}
      style={{
        fontSize: size,
        lineHeight,
        fontWeight: '300',
        letterSpacing: -1.1,
        minHeight: lineHeight * lines.length,
      }}
    >
      {lines.map((line, li) => {
        // A line appears once its first letter is due, so the cursor stays at
        // the end of the line being typed.
        const started = li === 0 || shown > before;
        before += lengths[li] ?? 0;
        if (!started) return null;
        return (
          <Fragment key={li}>
            {li > 0 ? '\n' : null}
            {line.map((seg, si) => {
              const visible = seg.text.slice(0, Math.max(0, budget));
              budget -= seg.text.length;
              return seg.bold ? (
                <Text key={si} style={{ fontSize: size, fontWeight: '500' }}>
                  {visible}
                </Text>
              ) : (
                <Fragment key={si}>{visible}</Fragment>
              );
            })}
          </Fragment>
        );
      })}
      {shown < total ? (
        <Text color={theme.palette.acc2} style={{ fontSize: size, fontWeight: '300' }}>
          |
        </Text>
      ) : null}
    </Text>
  );
});

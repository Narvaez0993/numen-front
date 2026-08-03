/**
 * Tap-vs-hold for the story player, as a pure controller so the race is
 * testable with fake timers. The rules come from every stories UI ever:
 * a quick touch navigates (left third back, rest next); holding pauses and
 * releasing the hold resumes — a hold release must NEVER also navigate.
 */

export const HOLD_DELAY_MS = 220;

export type TapZone = 'back' | 'next';

/** Where a tap lands, from the touch's horizontal fraction of the screen. */
export function classifyTap(xRatio: number): TapZone {
  return xRatio < 1 / 3 ? 'back' : 'next';
}

type Handlers = {
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onTap: (zone: TapZone) => void;
};

type TimerFns = {
  set: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clear: (id: ReturnType<typeof setTimeout>) => void;
};

const REAL_TIMERS: TimerFns = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (id) => clearTimeout(id),
};

export function createPressController(
  handlers: Handlers,
  timers: TimerFns = REAL_TIMERS,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let holding = false;
  // Captured on pressIn, BEFORE the hold timer can fire: the zone belongs to
  // where the finger landed, not to where it was released.
  let xRatio = 0;

  return {
    pressIn(ratio: number) {
      xRatio = ratio;
      holding = false;
      timer = timers.set(() => {
        timer = null;
        holding = true;
        handlers.onHoldStart();
      }, HOLD_DELAY_MS);
    },
    pressOut() {
      if (timer !== null) {
        timers.clear(timer);
        timer = null;
      }
      if (holding) {
        holding = false;
        handlers.onHoldEnd();
        return;
      }
      handlers.onTap(classifyTap(xRatio));
    },
  };
}

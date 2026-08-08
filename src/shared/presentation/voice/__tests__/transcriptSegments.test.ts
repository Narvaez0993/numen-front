import { absorb, NO_SEGMENTS, type SegmentState } from '../transcriptSegments';

/** Replays a recognizer's event stream, the way the hook does. */
function replay(events: [string, boolean][]): SegmentState {
  return events.reduce(
    (state, [text, isFinal]) => absorb(state, text, isFinal),
    NO_SEGMENTS,
  );
}

describe('absorb', () => {
  it('concatenates Android segments instead of replacing them', () => {
    // The bug this prevents: a user lists three expenses, pauses between each,
    // and only the last one survives because every final overwrote the rest.
    const state = replay([
      ['compré', false],
      ['compré 10 mil en café', true],
      ['5 mil', false],
      ['5 mil en papitas', true],
      ['8 mil en un mouse', true],
    ]);

    expect(state.transcript).toBe(
      'compré 10 mil en café 5 mil en papitas 8 mil en un mouse',
    );
  });

  it('keeps a partial out of the committed prefix', () => {
    const withPartial = replay([
      ['compré 10 mil en café', true],
      ['5 mi', false],
    ]);

    expect(withPartial.finalized).toBe('compré 10 mil en café');
    expect(withPartial.transcript).toBe('compré 10 mil en café 5 mi');
  });

  it('lets a later partial replace an earlier one', () => {
    const state = replay([
      ['un café', true],
      ['de cin', false],
      ['de cinco mil', false],
    ]);

    expect(state.transcript).toBe('un café de cinco mil');
  });

  it('is the identity on the iOS shape: cumulative partials, one final', () => {
    const state = replay([
      ['compré un', false],
      ['compré un café', false],
      ['compré un café de 5000', true],
    ]);

    expect(state.transcript).toBe('compré un café de 5000');
    expect(state.finalized).toBe('compré un café de 5000');
  });

  it('survives an empty result without leaving stray spaces', () => {
    const state = replay([
      ['un café', true],
      ['', true],
    ]);

    expect(state.transcript).toBe('un café');
  });
});

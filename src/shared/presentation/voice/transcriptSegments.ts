/**
 * Turning a stream of recognizer results into one transcript.
 *
 * The two platforms disagree about what a "final" result means, and the
 * difference is silent — the wrong rule loses words instead of throwing:
 *
 * - **Android**, in continuous mode, runs a SEGMENTED session. Each final
 *   result covers only the words since the previous final, so finals have to be
 *   concatenated. Assigning would keep just the last segment.
 * - **iOS** sends one cumulative final for the whole session, and its partials
 *   already contain everything said so far.
 *
 * Joining onto the finalized prefix satisfies both: on iOS the prefix is empty
 * until the single final lands, so a join is the identity.
 */

export type SegmentState = {
  /** Words the recognizer has committed. Never rewritten by a partial. */
  finalized: string;
  /** What to show and eventually send: finalized words plus the live tail. */
  transcript: string;
};

export const NO_SEGMENTS: SegmentState = { finalized: '', transcript: '' };

/** Glues a segment onto what came before, without doubling or leading spaces. */
function join(previous: string, next: string): string {
  if (previous === '') return next;
  if (next === '') return previous;
  return `${previous} ${next}`;
}

/**
 * Folds one `result` event into the running transcript. A final result extends
 * the committed prefix; a partial is a volatile tail that the next event
 * replaces, so it never touches `finalized`.
 */
export function absorb(
  state: SegmentState,
  text: string,
  isFinal: boolean,
): SegmentState {
  if (isFinal) {
    const finalized = join(state.finalized, text);
    return { finalized, transcript: finalized };
  }
  return { finalized: state.finalized, transcript: join(state.finalized, text) };
}

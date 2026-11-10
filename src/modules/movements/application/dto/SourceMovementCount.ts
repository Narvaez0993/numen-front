/**
 * How far the count of a source's movements goes before it says «más de …».
 * Asking for one more than this is what tells «exactly 200» apart from «more
 * than 200».
 */
export const SOURCE_COUNT_LIMIT = 200;

/** What deleting a source would leave behind, as far as the app could check (HU-07). */
export type SourceMovementCount = {
  /** Still asking the API. */
  checking: boolean;
  /** Movements that touch the source (either end of a transfer counts). */
  count: number;
  /** There are more than `SOURCE_COUNT_LIMIT`; `count` stops there. */
  more: boolean;
  /** The API could not be asked — the warning cannot say how many. */
  failed: boolean;
};

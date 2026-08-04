/**
 * Calendar helpers over `YYYY-MM-DD` strings — the shape the API stores a
 * movement's date in (a day, not an instant, so it never drifts across
 * timezones).
 *
 * Every function is pure and takes `today` explicitly: no `Date.now()` inside, so
 * tests are deterministic and a screen can pin "today" once per render.
 */

/** `YYYY-MM-DD` for a Date, read in the device's local calendar. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses `YYYY-MM-DD` as a local noon Date — noon dodges DST edge hours. */
export function fromIsoDate(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function addDays(iso: string, days: number): string {
  const date = fromIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export type DateRange = { from: string; to: string };

/** Inclusive first/last day of the month `iso` falls in. */
export function monthRange(iso: string): DateRange {
  const date = fromIsoDate(iso);
  const year = date.getFullYear();
  const month = date.getMonth();
  return {
    from: toIsoDate(new Date(year, month, 1, 12)),
    to: toIsoDate(new Date(year, month + 1, 0, 12)),
  };
}

/** The month `offset` months back from `iso` (`-1` is last month). */
export function shiftMonth(iso: string, offset: number): string {
  const date = fromIsoDate(iso);
  // Day 1 first, so shifting from the 31st never skips a short month.
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + offset, 1, 12));
}

/**
 * Whole days from `from` to `to`; negative when `to` already passed. Used to say
 * "in 3 days" without storing it — a persisted "in 3 days" is wrong tomorrow.
 */
export function daysBetween(from: string, to: string): number {
  const ms = fromIsoDate(to).getTime() - fromIsoDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** `2026-07` — the key the UI uses to name a month. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

const MONTHS: Record<string, readonly string[]> = {
  es: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
  en: [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ],
};

const MONTHS_LONG: Record<string, readonly string[]> = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

const WEEKDAYS: Record<string, readonly string[]> = {
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

function table(
  source: Record<string, readonly string[]>,
  language: string,
): readonly string[] {
  return source[language] ?? source.es!;
}

/** `11 jul` — a short, locale-aware day. */
export function shortDate(iso: string, language = 'es'): string {
  const date = fromIsoDate(iso);
  return `${date.getDate()} ${table(MONTHS, language)[date.getMonth()]}`;
}

/** `julio` / `July` — the name of the month `iso` falls in. */
export function monthName(iso: string, language = 'es'): string {
  return table(MONTHS_LONG, language)[fromIsoDate(iso).getMonth()]!;
}

const WEEKDAYS_LONG: Record<string, readonly string[]> = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/** `sábado` / `Saturday` — the weekday `iso` falls on. */
export function weekdayName(iso: string, language = 'es'): string {
  return table(WEEKDAYS_LONG, language)[fromIsoDate(iso).getDay()]!;
}

/**
 * The label a day group carries: `hoy`, `ayer`, or `sáb 11 jul`. Derived, never
 * stored — a persisted "sáb 11 may" is a lie the day after it is written.
 */
export function dayLabel(
  iso: string,
  today: string,
  language = 'es',
  labels: { today: string; yesterday: string } = { today: 'hoy', yesterday: 'ayer' },
): string {
  if (iso === today) return labels.today;
  if (iso === addDays(today, -1)) return labels.yesterday;
  const date = fromIsoDate(iso);
  return `${table(WEEKDAYS, language)[date.getDay()]} ${shortDate(iso, language)}`;
}

/** `today` first, then the previous days — the picker for "when did this happen". */
export function recentDays(count: number, today: string): string[] {
  return Array.from({ length: count }, (_, index) => addDays(today, -index));
}

/** Is `iso` strictly later than `other`? Plain string compare: ISO dates sort. */
export function isAfter(iso: string, other: string): boolean {
  return iso > other;
}

const WEEKDAYS_SHORT: Record<string, readonly string[]> = {
  es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

/** Column headers of a calendar, rotated to start the week where the locale does. */
export function weekdayInitials(language = 'es', weekStartsOn = 1): string[] {
  const names = table(WEEKDAYS_SHORT, language);
  return Array.from({ length: 7 }, (_, index) => names[(index + weekStartsOn) % 7]!);
}

/**
 * The Monday of an ISO week label (`2026-W30`), or `null` when the string is not
 * one. ISO weeks are what the agent's weekly reviews are keyed by, and the
 * oldest ones do not carry their dates in the payload — this recovers the range
 * from the key instead of printing `2026-w30` at the user.
 *
 * The anchor is January 4th: it is always inside ISO week 1, whatever weekday it
 * happens to land on.
 */
export function isoWeekMonday(period: string): string | null {
  const match = /^(\d{4})-W(\d{1,2})$/i.exec(period);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;

  const jan4 = new Date(year, 0, 4, 12);
  // 0 = Monday, so subtracting it lands on week 1's Monday.
  const jan4Weekday = (jan4.getDay() + 6) % 7;
  const week1Monday = addDays(toIsoDate(jan4), -jan4Weekday);
  return addDays(week1Monday, (week - 1) * 7);
}

/**
 * The month `iso` falls in, laid out as calendar weeks. `null` is padding before
 * the 1st or after the last day, so the grid always has 7 columns.
 */
export function monthMatrix(iso: string, weekStartsOn = 1): (string | null)[][] {
  const { from, to } = monthRange(iso);
  const firstWeekday = fromIsoDate(from).getDay();
  const lead = (firstWeekday - weekStartsOn + 7) % 7;
  const totalDays = fromIsoDate(to).getDate();

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => addDays(from, index)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  );
}

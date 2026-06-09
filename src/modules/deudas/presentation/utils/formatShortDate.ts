const MONTHS_ES = [
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
];

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatShortDate(iso: string | null, lang: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const months = lang.startsWith('en') ? MONTHS_EN : MONTHS_ES;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

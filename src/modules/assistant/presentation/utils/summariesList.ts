import type { AgentOutput, AgentOutputKind } from '../../domain/types/AgentFeed';

export type SummaryTab = 'monthly' | 'weekly';

const KIND_BY_TAB: Record<SummaryTab, AgentOutputKind> = {
  monthly: 'monthly_summary',
  weekly: 'weekly_review',
};

/** The tab's deliveries, newest first — the list arrives sorted, this only filters. */
export function forTab(outputs: AgentOutput[], tab: SummaryTab): AgentOutput[] {
  return outputs.filter((output) => output.kind === KIND_BY_TAB[tab]);
}

export type YearGroup = { year: string; items: AgentOutput[] };

/**
 * The older deliveries, grouped by the year their period belongs to (not by
 * `createdAt`: December's Corte is written in January, and it is December's).
 *
 * Groups keep the incoming order, so newest year first. The screen only prints
 * the year heading when there is more than one group — a lone "2026" over a
 * single list is furniture, and this is why the year is a grouping instead of a
 * filter control that would sit empty for the first eleven months.
 */
export function groupByYear(outputs: AgentOutput[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const output of outputs) {
    const year = output.period.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.items.push(output);
    else groups.push({ year, items: [output] });
  }
  return groups;
}

/**
 * What the month cost, read from the Corte's own big-number slide. `null` when
 * the playlist skipped it (a month too thin to have one), and then the row shows
 * no figure rather than a zero it did not measure.
 */
export function corteTotal(corte: AgentOutput): number | null {
  const slide = corte.slides.find((s) => s.type === 'big_number');
  return slide && slide.type === 'big_number' ? slide.amount : null;
}

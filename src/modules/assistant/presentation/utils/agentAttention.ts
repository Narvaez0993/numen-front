import type { AgentOutput } from '../../domain/types/AgentFeed';

/**
 * The single announcement slot Home shows above the hero: the newest unread
 * output, Corte first. One slot on purpose — two banners at once would split
 * the same excitement, and the Corte is the month's event while the weekly is
 * its Monday follow-up (it gets the slot as soon as the Corte is watched).
 *
 * Read is the only exit: announcing is the slot's whole job, so it lives on
 * `readAt`, never on a dismissal the user would have to perform. Access after
 * that belongs to the shelf.
 */
export function selectAnnouncement(outputs: AgentOutput[]): AgentOutput | null {
  const unread = outputs.filter((o) => o.readAt === null && o.dismissedAt === null);
  const newestFirst = [...unread].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    newestFirst.find((o) => o.kind === 'monthly_summary') ??
    newestFirst.find((o) => o.kind === 'weekly_review') ??
    null
  );
}

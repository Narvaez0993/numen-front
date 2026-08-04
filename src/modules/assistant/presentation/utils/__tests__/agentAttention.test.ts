import type { AgentOutput } from '../../../domain/types/AgentFeed';
import { selectAnnouncement } from '../agentAttention';

function output(overrides: Partial<AgentOutput> = {}): AgentOutput {
  return {
    id: 'out-1',
    kind: 'monthly_summary',
    period: '2026-07',
    slides: [{ type: 'cover', id: 'cover', text: 'Tu julio.' }],
    weekly: null,
    plays: [],
    createdAt: '2026-08-01T06:00:00Z',
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

describe('selectAnnouncement', () => {
  it('prefers an unread Corte over a newer unread weekly', () => {
    const corte = output({ id: 'corte' });
    const weekly = output({
      id: 'weekly',
      kind: 'weekly_review',
      period: '2026-W31',
      createdAt: '2026-08-03T07:00:00Z',
    });

    expect(selectAnnouncement([weekly, corte])?.id).toBe('corte');
  });

  it('announces the newest Corte when two are unread', () => {
    const june = output({ id: 'june', createdAt: '2026-07-01T06:00:00Z' });
    const july = output({ id: 'july', createdAt: '2026-08-01T06:00:00Z' });

    expect(selectAnnouncement([june, july])?.id).toBe('july');
  });

  it('falls back to the weekly once the Corte was watched', () => {
    const corte = output({ id: 'corte', readAt: '2026-08-01T09:00:00Z' });
    const weekly = output({ id: 'weekly', kind: 'weekly_review' });

    expect(selectAnnouncement([corte, weekly])?.id).toBe('weekly');
  });

  it('goes silent when everything was read — the slot never nags', () => {
    const corte = output({ readAt: '2026-08-01T09:00:00Z' });
    const weekly = output({
      id: 'weekly',
      kind: 'weekly_review',
      readAt: '2026-08-03T08:00:00Z',
    });

    expect(selectAnnouncement([corte, weekly])).toBeNull();
  });

  it('never announces a dismissed output', () => {
    const dismissed = output({ dismissedAt: '2026-08-01T09:00:00Z' });

    expect(selectAnnouncement([dismissed])).toBeNull();
  });

  it('tolerates an empty feed', () => {
    expect(selectAnnouncement([])).toBeNull();
  });
});

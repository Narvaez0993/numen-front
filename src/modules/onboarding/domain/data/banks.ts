import type { Bank } from '../../domain';

/** Generic source types (global-first: no per-country bank catalog). */
export const BANKS: readonly Bank[] = [
  { id: 'banco', kind: 'icon', icon: 'building-bank', iconColor: 'mint' },
  { id: 'billetera', kind: 'icon', icon: 'credit-card', iconColor: 'purple' },
  { id: 'efectivo', kind: 'icon', icon: 'cash', iconColor: 'amber' },
  { id: 'otro', kind: 'icon', icon: 'layout-grid', iconColor: 'neutral' },
];

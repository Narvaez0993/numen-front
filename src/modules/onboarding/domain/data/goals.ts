import type { Goal } from '../../domain';

export const GOALS: readonly Goal[] = [
  { id: 'gastos', icon: 'target', color: 'mint' },
  { id: 'ahorrar', icon: 'pig-money', color: 'amber' },
  { id: 'deudas', icon: 'chain-off', color: 'coral' },
];

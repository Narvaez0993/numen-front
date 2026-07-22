import type { Goal } from '../../domain/types/Goal';

/** Visual-prototype seed. Replaced by a repository when goals become real. */
export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Viaje a Japón',
    iconName: 'target',
    color: 'mint',
    target: 12000000,
    saved: 4100000,
    projectionMonth: 'octubre',
  },
  {
    id: 'g2',
    name: 'Fondo de emergencia',
    iconName: 'pig-money',
    color: 'purple',
    target: 6000000,
    saved: 5100000,
    projectionMonth: 'agosto',
  },
];

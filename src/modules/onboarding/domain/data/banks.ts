import type { Bank } from '../../domain';

export const BANKS: readonly Bank[] = [
  { id: 'bbva', kind: 'brand', letter: 'B', brandColor: '#004481' },
  { id: 'bancolombia', kind: 'brand', letter: 'B', brandColor: '#FCD116' },
  { id: 'davivienda', kind: 'brand', letter: 'D', brandColor: '#ED1C27' },
  { id: 'nu', kind: 'brand', letter: 'N', brandColor: '#820AD1' },
  { id: 'daviplata', kind: 'brand', letter: 'D', brandColor: '#ED1C27' },
  { id: 'nequi', kind: 'brand', letter: 'N', brandColor: '#280071' },
  { id: 'efectivo', kind: 'icon', icon: 'cash', iconColor: 'amber' },
  { id: 'otro', kind: 'icon', icon: 'dots', iconColor: 'neutral' },
];

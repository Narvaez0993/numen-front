import type { DebtsSnapshot } from '../../domain/types/Deuda';

export interface DeudasRepository {
  getSnapshot(): Promise<DebtsSnapshot>;
}

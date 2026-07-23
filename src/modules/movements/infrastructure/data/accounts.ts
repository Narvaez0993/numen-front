import type { Account, AccountId } from '../../domain/types/MovementsCatalog';

export const ACCOUNTS: Record<AccountId, Account> = {
  bbva_d: { id: 'bbva_d', name: 'BBVA Débito', short: 'BBVA' },
  banco: { id: 'banco', name: 'Bancolombia', short: 'Bancolombia' },
  efectivo: { id: 'efectivo', name: 'Efectivo', short: 'Efectivo' },
  bbva_c: { id: 'bbva_c', name: 'BBVA Crédito', short: 'BBVA TC' },
};

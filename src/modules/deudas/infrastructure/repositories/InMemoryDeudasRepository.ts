import type {
  Counterparty,
  DebtsSnapshot,
  Deuda,
  Payment,
  SharedEvent,
} from '../../domain/types/Deuda';
import type { DeudasRepository } from '../../application/ports/DeudasRepository';

const TODAY = '2026-05-14';

const pay = (
  date: string,
  amount: number,
  account = 'BBVA Débito',
  note?: string,
): Payment => ({ date, amount, account, note });

const COUNTERPARTIES: Counterparty[] = [
  { id: 'juan', name: 'Juan Felipe', initial: 'J', color: 'mint' },
  { id: 'maria', name: 'María', initial: 'M', color: 'purple' },
  { id: 'camila', name: 'Camila', initial: 'C', color: 'amber' },
  { id: 'daniel', name: 'Daniel', initial: 'D', color: 'coral' },
  { id: 'mama', name: 'Mamá', initial: 'M', color: 'pink' },
  { id: 'andres', name: 'Andrés', initial: 'A', color: 'purple' },
];

const DEBTS: Deuda[] = [
  {
    id: 'd-juan-taxi',
    direction: 'incoming',
    counterpartyId: 'juan',
    amount: 120000,
    balance: 120000,
    createdAt: '2026-05-10',
    dueDate: null,
    note: 'Taxi compartido aeropuerto',
    payments: [],
    eventId: null,
  },
  {
    id: 'd-maria',
    direction: 'incoming',
    counterpartyId: 'maria',
    amount: 500000,
    balance: 500000,
    createdAt: '2026-04-20',
    dueDate: null,
    note: 'Préstamo personal',
    payments: [],
    eventId: null,
  },
  {
    id: 'd-comida-juan',
    direction: 'incoming',
    counterpartyId: 'juan',
    amount: 60000,
    balance: 0,
    createdAt: '2026-05-09',
    dueDate: null,
    note: null,
    payments: [pay('2026-05-09', 60000, 'Nequi', 'Por Nequi')],
    eventId: 'ev-comida',
  },
  {
    id: 'd-comida-camila',
    direction: 'incoming',
    counterpartyId: 'camila',
    amount: 60000,
    balance: 30000,
    createdAt: '2026-05-09',
    dueDate: null,
    note: null,
    payments: [pay('2026-05-11', 30000, 'BBVA Débito')],
    eventId: 'ev-comida',
  },
  {
    id: 'd-comida-daniel',
    direction: 'incoming',
    counterpartyId: 'daniel',
    amount: 60000,
    balance: 60000,
    createdAt: '2026-05-09',
    dueDate: null,
    note: null,
    payments: [],
    eventId: 'ev-comida',
  },
  {
    id: 'd-mama',
    direction: 'outgoing',
    counterpartyId: 'mama',
    amount: 2000000,
    balance: 880000,
    createdAt: '2026-02-15',
    dueDate: '2026-12-15',
    note: 'Préstamo para inicial moto',
    payments: [
      pay('2026-03-20', 400000, 'BBVA Débito', 'Primer abono'),
      pay('2026-04-18', 400000, 'BBVA Débito', 'Segundo abono'),
      pay('2026-05-10', 320000, 'Bancolombia'),
    ],
    eventId: null,
  },
  {
    id: 'd-andres',
    direction: 'outgoing',
    counterpartyId: 'andres',
    amount: 450000,
    balance: 450000,
    createdAt: '2026-05-02',
    dueDate: '2026-05-17',
    note: 'Entrada concierto',
    payments: [],
    eventId: null,
  },
];

const SHARED_EVENTS: SharedEvent[] = [
  {
    id: 'ev-comida',
    name: 'Comida del jueves',
    icon: 'tools-kitchen-2',
    iconColor: 'purple',
    totalAmount: 180000,
    date: '2026-05-09',
    debtIds: ['d-comida-juan', 'd-comida-camila', 'd-comida-daniel'],
  },
];

export class InMemoryDeudasRepository implements DeudasRepository {
  async getSnapshot(): Promise<DebtsSnapshot> {
    return {
      today: TODAY,
      counterparties: COUNTERPARTIES,
      debts: DEBTS,
      events: SHARED_EVENTS,
    };
  }
}

import type { Plan, PlanComparison } from '../../domain';
import type { PlanRepository } from '../../application';

const PLANS: readonly Plan[] = [
  {
    id: 'esencial',
    title: 'Free',
    highlight: false,
    isCurrent: true,
    free: { amount: 'Gratis' },
    pricing: null,
    featuresHeader: null,
    features: [
      'Registro manual ilimitado (gastos e ingresos)',
      { strong: '60 registros con IA', text: 'voz, foto o texto, al mes' },
      { strong: '10 mensajes con tu agente', text: 'al mes' },
      'Resumen mensual del agente',
      '2 cuentas + 1 tarjeta de crédito',
      '1 presupuesto global + 2 topes por categoría',
      '1 meta de ahorro activa',
      'Deudas compartidas ilimitadas',
    ],
    ctaLabel: null,
  },
  {
    id: 'plus',
    title: 'Plus',
    highlight: true,
    isCurrent: false,
    free: null,
    pricing: {
      mensual: {
        amount: 'US$7.99',
        unit: '/mes',
        sub: 'o US$49.99/año · ahorra ~48%',
      },
      anual: {
        amount: 'US$49.99',
        unit: '/año',
        sub: 'US$4.17/mes equivalente',
      },
    },
    featuresHeader: 'Todo de Free, más:',
    features: [
      { strong: '300 registros + 300 mensajes', text: 'al mes, de sobra' },
      {
        strong: 'Tu agente trabaja solo',
        text: 'revisión semanal, cierre de mes y anomalías',
      },
      'Cuentas, presupuestos y metas ilimitados',
      'Categorías personalizadas',
      'Export CSV/PDF ilimitado',
      'Multi-moneda (para viajes)',
    ],
    ctaLabel: 'Activar Plus',
  },
];

export class InMemoryPlanRepository implements PlanRepository {
  async getComparison(): Promise<PlanComparison> {
    return { plans: PLANS };
  }
}

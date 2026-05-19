import type { Plan, PlanComparison } from '../../domain';
import type { PlanRepository } from '../../application';

const PLANS: readonly Plan[] = [
  {
    id: 'esencial',
    title: 'Esencial',
    highlight: false,
    isCurrent: true,
    free: { amount: 'Gratis' },
    pricing: null,
    featuresHeader: null,
    features: [
      'Registro manual ilimitado',
      '30 acciones IA/mes (voz, foto, asistente)',
      '2 cuentas + 1 tarjeta de crédito',
      'Categorías estándar + 1 presupuesto mensual',
      'Insights básicos',
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
        amount: '$19.900',
        unit: '/mes',
        sub: 'o $179.900/año · ahorra $58.900',
      },
      anual: {
        amount: '$179.900',
        unit: '/año',
        sub: '$14.992/mes equivalente',
      },
    },
    featuresHeader: 'Todo de Esencial, más:',
    features: [
      { strong: 'IA ilimitada', text: 'voz, foto, asistente sin tope' },
      'Cuentas y tarjetas ilimitadas',
      'Todos los insights (patrones, anomalías, proyecciones)',
      'Categorías personalizadas + presupuestos por categoría',
      'Exportar CSV y PDF mensual',
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

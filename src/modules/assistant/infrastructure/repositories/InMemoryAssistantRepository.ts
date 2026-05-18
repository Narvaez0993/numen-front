import type { AssistantSnapshot } from '../../domain/types/Assistant';
import type { AssistantRepository } from '../../application/ports/AssistantRepository';

/**
 * Mirrors INSIGHTS + SUGGESTED_CHIPS from the design bundle (`assistant.jsx`).
 * Replace with HttpAssistantRepository once the back exposes /assistant.
 */
export class InMemoryAssistantRepository implements AssistantRepository {
  async getSnapshot(): Promise<AssistantSnapshot> {
    return {
      insights: [
        {
          id: 'alerta-cafe',
          type: 'ALERTA',
          color: 'coral',
          title: 'Casi te pasas con Café',
          body: 'Llevas $422.400 de tu presupuesto de $440.000 — 96% con 17 días para que cierre mayo.',
          cta: 'Ajustar presupuesto',
        },
        {
          id: 'patron-viernes',
          type: 'PATRÓN',
          color: 'purple',
          title: 'Gastas 40% más los viernes',
          body: 'En las últimas 4 semanas, los viernes promedian $124.000 vs $87.000 los otros días.',
          cta: 'Ver detalle',
          chart: [
            { label: 'L', v: 80 },
            { label: 'M', v: 65 },
            { label: 'X', v: 92 },
            { label: 'J', v: 78 },
            { label: 'V', v: 124 },
            { label: 'S', v: 95 },
            { label: 'D', v: 60 },
          ],
          chartHighlight: 4,
        },
        {
          id: 'subs-total',
          type: 'SUSCRIPCIÓN',
          color: 'amber',
          title: '3 suscripciones por $92.800/mes',
          body: 'Netflix, Spotify y Notion. Proyectado en el año: $1.113.600.',
          cta: 'Ver suscripciones',
        },
        {
          id: 'accion-clasificar',
          type: 'ACCIÓN',
          color: 'mint',
          title: '5 gastos sin clasificar',
          body: 'Detectamos cargos sin categoría desde el lunes. ¿Querés que te ayude a etiquetarlos?',
          cta: 'Revisar ahora',
        },
      ],
      suggestedChips: [
        { id: 'cafe', label: '¿Cuánto llevo en café?' },
        { id: 'subs', label: 'Mis suscripciones' },
        { id: 'abril', label: 'Comparar con abril' },
        { id: 'finde', label: 'Gastos del fin de semana' },
        { id: 'saldo', label: '¿Cuál es mi saldo?' },
      ],
    };
  }
}

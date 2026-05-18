import type { AccentColor } from '@/shared/domain';

export type InsightType = 'ACCIÓN' | 'SUSCRIPCIÓN' | 'PATRÓN' | 'ALERTA';

export type ChartPoint = {
  label: string;
  v: number;
};

export type Insight = {
  id: string;
  type: InsightType;
  color: AccentColor;
  title: string;
  body: string;
  cta: string;
  chart?: ChartPoint[];
  chartHighlight?: number;
};

export type SuggestedChip = {
  id: CannedResponseId;
  label: string;
};

export type CannedResponseId = 'cafe' | 'subs' | 'abril' | 'saldo' | 'finde' | 'honest';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; cannedId: CannedResponseId; text?: undefined }
  | { id: number; role: 'assistant'; text: string; cannedId?: undefined };

export type AssistantSnapshot = {
  insights: Insight[];
  suggestedChips: SuggestedChip[];
};

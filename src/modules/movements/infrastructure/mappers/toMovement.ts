import type { CurrencyCode } from '@/shared/domain';

import type {
  CapturedVia,
  Movement,
  MovementType,
  SourceRef,
  SourceType,
} from '../../domain';

/** A movement as the API sends it: snake_case, references only, no names. */
export type MovementResponse = {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  source_type: string;
  source_id: string;
  destination_type: string | null;
  destination_id: string | null;
  category_id: string | null;
  occurred_on: string;
  captured_via: string;
};

/**
 * The single place the wire shape becomes a `Movement`. Home embeds the same
 * payload in its overview, so both endpoints share this one parser instead of
 * drifting apart field by field.
 */
export function toMovement(dto: MovementResponse): Movement {
  return {
    id: dto.id,
    type: dto.type as MovementType,
    description: dto.description,
    amount: dto.amount,
    currency: dto.currency as CurrencyCode,
    source: { type: dto.source_type as SourceType, id: dto.source_id },
    destination: toSourceRef(dto.destination_type, dto.destination_id),
    categoryId: dto.category_id,
    occurredOn: dto.occurred_on,
    capturedVia: dto.captured_via as CapturedVia,
  };
}

/** Both halves travel together or not at all: an id alone cannot say where it lives. */
function toSourceRef(type: string | null, id: string | null): SourceRef | null {
  if (type === null || id === null) return null;
  return { type: type as SourceType, id };
}

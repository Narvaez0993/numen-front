import type { CannedResponseId } from '../../domain/types/Assistant';

/**
 * Maps a user free-form query to one of the canned response ids.
 * Returns null when no canned answer is appropriate — caller decides whether
 * to call a real LLM endpoint or fall back to the honest "no data" reply.
 */
export function matchCanned(query: string): Exclude<CannedResponseId, 'honest'> | null {
  const q = query.toLowerCase();
  if (q.includes('café') || q.includes('cafe')) return 'cafe';
  if (q.includes('suscripcio') || q.includes('subs')) return 'subs';
  if (q.includes('abril')) return 'abril';
  if (q.includes('saldo') || q.includes('cuenta')) return 'saldo';
  if (
    q.includes('finde') ||
    q.includes('fin de semana') ||
    q.includes('sábado') ||
    q.includes('domingo')
  )
    return 'finde';
  return null;
}

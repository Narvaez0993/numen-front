/**
 * Colombian peso formatter — `$1.234.567`.
 *
 * - Dot as thousand separator (no decimals; COP is whole-pesos in practice).
 * - Negative numbers come as `-$1.234.567`.
 * - Rounds to nearest integer.
 */
export function formatCOP(n: number): string {
  const abs = Math.round(Math.abs(n));
  const withDots = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = n < 0 ? '-' : '';
  return `${sign}$${withDots}`;
}

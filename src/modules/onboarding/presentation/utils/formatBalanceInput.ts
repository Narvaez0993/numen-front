/** Raw keystrokes → an integer amount in the minor unit of the user's currency. */
export function parseBalanceDigits(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

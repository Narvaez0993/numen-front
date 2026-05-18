export function parseBalanceDigits(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatBalanceInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number.parseInt(digits, 10).toLocaleString('es-CO').replace(/,/g, '.');
}

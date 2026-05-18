import { matchCanned } from '../matchCanned';

describe('matchCanned', () => {
  it('returns "cafe" for café-related queries (with and without accent)', () => {
    expect(matchCanned('¿Cuánto llevo en café?')).toBe('cafe');
    expect(matchCanned('cuanto llevo en cafe')).toBe('cafe');
  });

  it('returns "subs" for subscription queries', () => {
    expect(matchCanned('Mis suscripciones')).toBe('subs');
    expect(matchCanned('cuáles son mis subs')).toBe('subs');
  });

  it('returns "abril" for past-month comparisons', () => {
    expect(matchCanned('Comparar con abril')).toBe('abril');
  });

  it('returns "saldo" for balance queries', () => {
    expect(matchCanned('¿Cuál es mi saldo?')).toBe('saldo');
    expect(matchCanned('quiero ver mis cuentas')).toBe('saldo');
  });

  it('returns "finde" for weekend queries (multiple variants)', () => {
    expect(matchCanned('Gastos del fin de semana')).toBe('finde');
    expect(matchCanned('cómo gasté el finde')).toBe('finde');
    expect(matchCanned('qué pasó el sábado')).toBe('finde');
    expect(matchCanned('y el domingo?')).toBe('finde');
  });

  it('returns null when no canned answer fits', () => {
    expect(matchCanned('cuánto vale el metro en bogotá')).toBeNull();
  });
});

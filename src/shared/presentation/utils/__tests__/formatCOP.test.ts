import { formatCOP } from '../formatCOP';

describe('formatCOP', () => {
  it('formats whole pesos with dot as thousand separator', () => {
    expect(formatCOP(67000)).toBe('$67.000');
    expect(formatCOP(5245000)).toBe('$5.245.000');
    expect(formatCOP(0)).toBe('$0');
    expect(formatCOP(900)).toBe('$900');
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatCOP(-15500)).toBe('-$15.500');
    expect(formatCOP(-1234567)).toBe('-$1.234.567');
  });

  it('rounds to nearest integer', () => {
    expect(formatCOP(15500.4)).toBe('$15.500');
    expect(formatCOP(15500.6)).toBe('$15.501');
  });
});

import { isAssistantRoute } from '../Assistant';

describe('isAssistantRoute', () => {
  it('accepts every route of the allowlist', () => {
    expect(isAssistantRoute('/goals')).toBe(true);
    expect(isAssistantRoute('/budgets')).toBe(true);
  });

  it('rejects anything the server should never have sent', () => {
    expect(isAssistantRoute('https://evil.example')).toBe(false);
    expect(isAssistantRoute('/admin')).toBe(false);
    expect(isAssistantRoute('')).toBe(false);
  });
});

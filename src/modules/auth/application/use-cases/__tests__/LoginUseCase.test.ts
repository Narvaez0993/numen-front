import { InMemoryAuthRepository } from '@/modules/auth/infrastructure';

import { LoginUseCase } from '../LoginUseCase';

describe('LoginUseCase', () => {
  it('returns ok with session data on valid credentials', async () => {
    const repo = new InMemoryAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute({
      email: 'demo@deshka.app',
      password: 'demo1234',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe('demo@deshka.app');
      expect(result.value.accessToken).toMatch(/^dev-access-/);
    }
  });

  it('returns err on invalid credentials', async () => {
    const repo = new InMemoryAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute({
      email: 'demo@deshka.app',
      password: 'wrong-password',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Invalid email or password/i);
    }
  });

  it('returns err on malformed email', async () => {
    const repo = new InMemoryAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute({
      email: 'not-an-email',
      password: 'demo1234',
    });

    expect(result.ok).toBe(false);
  });
});

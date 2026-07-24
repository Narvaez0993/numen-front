import { AuthRepository } from '../../domain';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}

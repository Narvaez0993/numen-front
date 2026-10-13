import { AuthRepository, type AuthSession } from '../../domain';

/**
 * Who the server says this is, right now.
 *
 * The stored session is a snapshot of the moment someone signed in. Anything
 * that can change underneath it — the plan, most of all — has to be asked for
 * again, or the app spends the rest of the session enforcing a rule that is no
 * longer true.
 */
export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<AuthSession | null> {
    return this.authRepository.currentSession();
  }
}

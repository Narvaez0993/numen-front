import {
  AuthCredentials,
  AuthRepository,
  AuthSession,
  Email,
  InvalidCodeError,
  InvalidCredentialsError,
  RegisterCredentials,
  SessionExpiredError,
  User,
} from '../../domain';

type SeedUser = {
  user: User;
  password: string;
};

const DEV_CODE = '123456';

const seedUsers: SeedUser[] = [
  {
    user: new User({
      id: 'usr-1',
      email: Email.create('demo@deshka.app'),
      displayName: 'Demo',
      tier: 'free',
      emailVerified: true,
    }),
    password: 'demo1234',
  },
];

export class InMemoryAuthRepository implements AuthRepository {
  private session: AuthSession | null = null;
  private pending = new Map<string, { password: string }>();

  async register(credentials: RegisterCredentials): Promise<void> {
    this.pending.set(credentials.email.value, {
      password: credentials.password.value,
    });
  }

  async verifyEmail(email: Email, code: string): Promise<AuthSession> {
    const registered = this.pending.get(email.value);
    if (!registered || code !== DEV_CODE) {
      throw new InvalidCodeError();
    }
    // The name is set later via `updateDisplayName`, after verification.
    this.session = this.issue(
      new User({
        id: `usr-${this.pending.size + 1}`,
        email,
        displayName: '',
        tier: 'free',
        emailVerified: true,
      }),
    );
    return this.session;
  }

  async resendCode(): Promise<void> {
    // No-op in memory; the dev code never changes.
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    const match = seedUsers.find(
      (entry) =>
        entry.user.email.equals(credentials.email) &&
        entry.password === credentials.password.value,
    );
    if (!match) {
      throw new InvalidCredentialsError();
    }
    this.session = this.issue(match.user);
    return this.session;
  }

  async refresh(): Promise<AuthSession> {
    if (!this.session) {
      throw new SessionExpiredError();
    }
    this.session = this.issue(this.session.user);
    return this.session;
  }

  async logout(): Promise<void> {
    this.session = null;
  }

  async updateDisplayName(displayName: string): Promise<User> {
    if (!this.session) {
      throw new SessionExpiredError();
    }
    const current = this.session.user;
    const updated = new User({
      id: current.id,
      email: current.email,
      displayName,
      tier: current.tier,
      emailVerified: current.emailVerified,
    });
    this.session = { ...this.session, user: updated };
    return updated;
  }

  async currentSession(): Promise<AuthSession | null> {
    return this.session;
  }

  private issue(user: User): AuthSession {
    return {
      user,
      accessToken: `dev-access-${user.id}`,
      refreshToken: `dev-refresh-${user.id}`,
    };
  }
}

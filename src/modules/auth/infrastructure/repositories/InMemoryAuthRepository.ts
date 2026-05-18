import {
  AuthCredentials,
  AuthRepository,
  AuthSession,
  Email,
  InvalidCredentialsError,
  User,
} from '../../domain';

type SeedUser = {
  user: User;
  password: string;
};

const seedUsers: SeedUser[] = [
  {
    user: new User({
      id: 'usr-1',
      email: Email.create('demo@numen.app'),
      displayName: 'Demo',
    }),
    password: 'demo1234',
  },
];

export class InMemoryAuthRepository implements AuthRepository {
  private session: AuthSession | null = null;

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    const match = seedUsers.find(
      (entry) =>
        entry.user.email.equals(credentials.email) &&
        entry.password === credentials.password.value,
    );
    if (!match) {
      throw new InvalidCredentialsError();
    }
    this.session = {
      user: match.user,
      accessToken: `dev-access-${match.user.id}`,
      refreshToken: `dev-refresh-${match.user.id}`,
    };
    return this.session;
  }

  async logout(): Promise<void> {
    this.session = null;
  }

  async currentSession(): Promise<AuthSession | null> {
    return this.session;
  }
}

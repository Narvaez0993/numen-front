import type { AuthSession } from '../../domain';

export type AuthSessionDTO = {
  userId: string;
  email: string;
  displayName: string;
  tier: string;
  emailVerified: boolean;
  currency: string;
  accessToken: string;
  refreshToken: string;
};

export function toAuthSessionDTO(session: AuthSession): AuthSessionDTO {
  return {
    userId: session.user.id,
    email: session.user.email.value,
    displayName: session.user.displayName,
    tier: session.user.tier,
    emailVerified: session.user.emailVerified,
    currency: session.user.currency,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

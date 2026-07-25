import type { User } from '../../domain';

export type ProfileDTO = {
  userId: string;
  email: string;
  displayName: string;
  tier: string;
  emailVerified: boolean;
  currency: string;
};

export function toProfileDTO(user: User): ProfileDTO {
  return {
    userId: user.id,
    email: user.email.value,
    displayName: user.displayName,
    tier: user.tier,
    emailVerified: user.emailVerified,
    currency: user.currency,
  };
}

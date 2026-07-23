import { useQuery } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type { UserProfile } from '../../domain/types/UserProfile';

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: () => container.getProfileUseCase.execute(),
  });
}

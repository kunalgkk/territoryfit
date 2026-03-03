import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface UserProfile {
  name: string;
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Use getFitnessProfile as the user profile source
      const profile = await actor.getFitnessProfile();
      if (!profile) return null;
      return { name: profile.fullName };
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

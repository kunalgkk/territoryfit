import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FitnessProfile, WorkoutSession } from '../backend';
import { Principal } from '@dfinity/principal';

// Fitness Profile
export function useFitnessProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<FitnessProfile | null>({
    queryKey: ['fitnessProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFitnessProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterFitnessProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: FitnessProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerFitnessProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitnessProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Workout Sessions
export function useWorkoutSessions(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutSession[]>({
    queryKey: ['workoutSessions', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getWorkoutSessions(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useRecordWorkoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordWorkoutSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSessions'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['territoryZones'] });
      queryClient.invalidateQueries({ queryKey: ['userOwnedZones'] });
      queryClient.invalidateQueries({ queryKey: ['totalUserStats'] });
    },
  });
}

// Analytics
export function useAnalyticsSummary(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['analyticsSummary', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getAnalyticsSummary(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// Territory Zones
export function useTerritoryZones() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['territoryZones'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTerritoryZones();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useListZones() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['listZones'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listZones();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useZonePassCounts(zone: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['zonePassCounts', zone],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getZonePassCounts(zone);
    },
    enabled: !!actor && !isFetching && !!zone,
  });
}

export function useUserOwnedZones(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ['userOwnedZones', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      return actor.getUserOwnedZones(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useTotalUserStats(user?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['totalUserStats', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getTotalUserStats(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// Admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

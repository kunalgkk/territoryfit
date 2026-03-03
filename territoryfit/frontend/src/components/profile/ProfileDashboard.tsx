import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useFitnessProfile, useUserOwnedZones, useTotalUserStats, useWorkoutSessions } from '../../hooks/useQueries';
import { LevelProgressBar } from '../gamification/LevelProgressBar';
import { TierBadge } from '../subscription/TierBadge';
import { LoginStreakBadge } from '../gamification/LoginStreakBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Flame, Activity, Trophy } from 'lucide-react';
import { calculateXP } from '../../utils/gamification';
import { SubscriptionTier } from '../../utils/subscriptionGating';

interface ProfileDashboardProps {
  tier?: SubscriptionTier;
}

export function ProfileDashboard({ tier = 'free' }: ProfileDashboardProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();

  const { data: profile, isLoading: profileLoading } = useFitnessProfile();
  const { data: ownedZones } = useUserOwnedZones(principal);
  const { data: totalStats } = useTotalUserStats(principal);
  const { data: sessions = [] } = useWorkoutSessions(principal);

  const totalXP = sessions.reduce((sum, s) => sum + calculateXP(s), 0);

  if (profileLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Zones', value: String(ownedZones ?? 0), icon: MapPin },
    { label: 'Distance', value: `${totalStats?.distance ?? 0}km`, icon: Activity },
    { label: 'Calories', value: String(totalStats?.calories ?? 0), icon: Flame },
    { label: 'Workouts', value: String(sessions.length), icon: Trophy },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-border flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {profile?.fullName?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <div className="font-bold text-foreground">{profile?.fullName ?? 'Anonymous'}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <TierBadge tier={tier} />
              <LoginStreakBadge />
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <LevelProgressBar totalXP={totalXP} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-3 text-center">
            <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <div className="text-sm font-bold font-mono text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

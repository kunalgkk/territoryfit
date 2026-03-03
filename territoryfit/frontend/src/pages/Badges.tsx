import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWorkoutSessions, useUserOwnedZones } from '../hooks/useQueries';
import { BADGE_CATALOG, checkBadgeUnlock } from '../utils/gamification';
import { Award, Lock } from 'lucide-react';

export function BadgesPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: sessions = [] } = useWorkoutSessions(principal);
  const { data: ownedZones } = useUserOwnedZones(principal);

  const totalDistance = sessions.reduce((s, w) => s + Number(w.distanceKm), 0);
  const totalCalories = sessions.reduce((s, w) => s + Number(w.caloriesBurned), 0);

  const bestPaceSession = sessions
    .filter(s => Number(s.distanceKm) > 0)
    .reduce<typeof sessions[0] | null>((best, s) => {
      const pace = Number(s.durationSeconds) / Number(s.distanceKm);
      if (!best) return s;
      return pace < Number(best.durationSeconds) / Number(best.distanceKm) ? s : best;
    }, null);

  const bestPace = bestPaceSession
    ? Number(bestPaceSession.durationSeconds) / Number(bestPaceSession.distanceKm)
    : undefined;

  const stats = {
    totalWorkouts: sessions.length,
    totalDistanceKm: totalDistance,
    totalCalories,
    zonesOwned: Number(ownedZones ?? 0),
    bestPace,
  };

  const earned = BADGE_CATALOG.filter(b => checkBadgeUnlock(b.id, stats));
  const locked = BADGE_CATALOG.filter(b => !checkBadgeUnlock(b.id, stats));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-yellow-400" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Badges</h1>
          <p className="text-xs text-muted-foreground">{earned.length} / {BADGE_CATALOG.length} earned</p>
        </div>
      </div>

      {earned.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Earned</div>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(badge => (
              <div key={badge.id} className="bg-card rounded-xl border border-border p-4">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-sm font-bold text-foreground">{badge.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                <div className="text-xs font-mono text-muted-foreground mt-2 border-t border-border pt-2">{badge.criteria}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Locked</div>
        <div className="grid grid-cols-2 gap-3">
          {locked.map(badge => (
            <div key={badge.id} className="bg-card rounded-xl border border-border p-4 opacity-50">
              <div className="relative inline-block mb-2">
                <div className="text-3xl grayscale">{badge.icon}</div>
                <Lock className="w-3 h-3 text-muted-foreground absolute -bottom-1 -right-1" />
              </div>
              <div className="text-sm font-bold text-foreground">{badge.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
              <div className="text-xs font-mono text-muted-foreground mt-2 border-t border-border pt-2">{badge.criteria}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

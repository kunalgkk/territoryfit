import React from 'react';
import { WorkoutSession } from '../../backend';
import { formatDuration, formatPace } from '../../utils/gamification';
import { Trophy } from 'lucide-react';

interface PersonalBestsProps {
  sessions: WorkoutSession[];
}

export function PersonalBests({ sessions }: PersonalBestsProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Complete workouts to see your personal bests
      </div>
    );
  }

  const longestDistance = sessions.reduce((max, s) => Math.max(max, Number(s.distanceKm)), 0);
  const mostCalories = sessions.reduce((max, s) => Math.max(max, Number(s.caloriesBurned)), 0);
  const longestDuration = sessions.reduce((max, s) => Math.max(max, Number(s.durationSeconds)), 0);

  const bestPaceSession = sessions
    .filter(s => Number(s.distanceKm) > 0)
    .reduce<WorkoutSession | null>((best, s) => {
      const pace = Number(s.durationSeconds) / Number(s.distanceKm);
      if (!best) return s;
      const bestPace = Number(best.durationSeconds) / Number(best.distanceKm);
      return pace < bestPace ? s : best;
    }, null);

  const bests = [
    { label: 'Longest Run', value: `${longestDistance} km`, icon: '🏃' },
    { label: 'Best Pace', value: bestPaceSession ? `${formatPace(Number(bestPaceSession.distanceKm), Number(bestPaceSession.durationSeconds))} /km` : '--', icon: '⚡' },
    { label: 'Most Calories', value: `${mostCalories} cal`, icon: '🔥' },
    { label: 'Longest Session', value: formatDuration(longestDuration), icon: '⏱' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {bests.map(({ label, value, icon }) => (
        <div key={label} className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <div className="text-lg">{icon}</div>
          <div className="text-sm font-bold font-mono text-foreground mt-1">{value}</div>
        </div>
      ))}
    </div>
  );
}

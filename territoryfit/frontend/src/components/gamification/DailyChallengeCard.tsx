import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { WorkoutSession } from '../../backend';
import { Target, Zap } from 'lucide-react';

interface DailyChallengeCardProps {
  sessions: WorkoutSession[];
}

const CHALLENGES = [
  { id: 'distance', label: 'Log 5km today', target: 5, unit: 'km', xp: 50 },
  { id: 'calories', label: 'Burn 300 calories', target: 300, unit: 'cal', xp: 40 },
  { id: 'workouts', label: 'Complete 2 workouts', target: 2, unit: 'sessions', xp: 30 },
];

export function DailyChallengeCard({ sessions }: DailyChallengeCardProps) {
  const today = new Date().toDateString();

  const todaySessions = useMemo(() => {
    return sessions.filter(s => {
      const d = new Date(Number(s.timestamp) / 1_000_000);
      return d.toDateString() === today;
    });
  }, [sessions, today]);

  const challenge = CHALLENGES[new Date().getDay() % CHALLENGES.length];

  const progress = useMemo(() => {
    if (challenge.id === 'distance') {
      return todaySessions.reduce((sum, s) => sum + Number(s.distanceKm), 0);
    } else if (challenge.id === 'calories') {
      return todaySessions.reduce((sum, s) => sum + Number(s.caloriesBurned), 0);
    } else {
      return todaySessions.length;
    }
  }, [todaySessions, challenge.id]);

  const percentage = Math.min(100, Math.floor((progress / challenge.target) * 100));
  const completed = percentage >= 100;

  return (
    <div className={`rounded-xl border p-4 ${completed ? 'border-white/30 bg-white/5' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Daily Challenge</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <Zap className="w-3 h-3" />
          +{challenge.xp} XP
        </div>
      </div>
      <div className="text-sm font-semibold text-foreground mb-3">{challenge.label}</div>
      <Progress value={percentage} className="h-2 bg-secondary mb-2" />
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>{progress.toFixed(challenge.id === 'distance' ? 1 : 0)} / {challenge.target} {challenge.unit}</span>
        <span>{completed ? '✓ Complete!' : `${percentage}%`}</span>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { WorkoutSession } from '../../backend';
import { Target } from 'lucide-react';

interface GoalTrackerProps {
  sessions: WorkoutSession[];
}

export function GoalTracker({ sessions }: GoalTrackerProps) {
  const [dailyDistanceGoal] = useState(5);
  const [dailyCalorieGoal] = useState(300);

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => {
    const d = new Date(Number(s.timestamp) / 1_000_000);
    return d.toDateString() === today;
  });

  const todayDistance = todaySessions.reduce((sum, s) => sum + Number(s.distanceKm), 0);
  const todayCalories = todaySessions.reduce((sum, s) => sum + Number(s.caloriesBurned), 0);

  const distancePct = Math.min(100, Math.floor((todayDistance / dailyDistanceGoal) * 100));
  const caloriePct = Math.min(100, Math.floor((todayCalories / dailyCalorieGoal) * 100));

  const goals = [
    { label: 'Daily Distance', current: todayDistance, target: dailyDistanceGoal, unit: 'km', pct: distancePct },
    { label: 'Daily Calories', current: todayCalories, target: dailyCalorieGoal, unit: 'cal', pct: caloriePct },
  ];

  return (
    <div className="space-y-4">
      {goals.map(({ label, current, target, unit, pct }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-foreground">{label}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {current.toFixed(1)} / {target} {unit}
            </span>
          </div>
          <Progress value={pct} className="h-2 bg-secondary" />
          <div className="text-right text-xs text-muted-foreground mt-1 font-mono">{pct}%</div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { Dumbbell } from 'lucide-react';

interface Exercise {
  name: string;
  detail: string;
  instruction: string;
}

interface WorkoutRoutineCardProps {
  goal: string;
}

const ROUTINES: Record<string, Exercise[]> = {
  weight_loss: [
    { name: 'HIIT Intervals', detail: '8 rounds × 30s on / 30s off', instruction: 'Sprint at max effort, rest completely between rounds' },
    { name: 'Jump Rope', detail: '3 sets × 3 minutes', instruction: 'Maintain steady rhythm, rest 60s between sets' },
    { name: 'Burpees', detail: '4 sets × 15 reps', instruction: 'Full range of motion, explosive jump at top' },
  ],
  muscle_gain: [
    { name: 'Push-Ups', detail: '4 sets × 20 reps', instruction: 'Slow descent (3s), explosive push' },
    { name: 'Bodyweight Squats', detail: '4 sets × 25 reps', instruction: 'Parallel depth, drive through heels' },
    { name: 'Pull-Ups', detail: '3 sets × max reps', instruction: 'Full hang to chin over bar' },
  ],
  endurance: [
    { name: 'Long Run', detail: '45-60 minutes', instruction: 'Conversational pace, maintain heart rate zone 2' },
    { name: 'Tempo Run', detail: '20 minutes', instruction: 'Comfortably hard pace, slightly breathless' },
    { name: 'Recovery Walk', detail: '30 minutes', instruction: 'Easy pace, active recovery' },
  ],
  general_fitness: [
    { name: 'Morning Run', detail: '30 minutes', instruction: 'Easy to moderate pace' },
    { name: 'Core Circuit', detail: '3 rounds × 10 min', instruction: 'Plank, crunches, leg raises' },
    { name: 'Stretching', detail: '15 minutes', instruction: 'Full body flexibility routine' },
  ],
};

export function WorkoutRoutineCard({ goal }: WorkoutRoutineCardProps) {
  const exercises = ROUTINES[goal] || ROUTINES.general_fitness;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Today's Routine</span>
      </div>
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold font-mono text-foreground">{i + 1}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{ex.name}</div>
              <div className="text-xs font-mono text-muted-foreground">{ex.detail}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{ex.instruction}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { WorkoutSession } from '../../backend';
import { Droplets } from 'lucide-react';

interface HydrationReminderProps {
  sessions: WorkoutSession[];
}

export function HydrationReminder({ sessions }: HydrationReminderProps) {
  const lastSession = sessions.length > 0
    ? sessions.reduce((latest, s) => Number(s.timestamp) > Number(latest.timestamp) ? s : latest)
    : null;

  const lastDurationMinutes = lastSession ? Number(lastSession.durationSeconds) / 60 : 0;
  const recommendedMl = Math.max(500, Math.floor((lastDurationMinutes / 30) * 500) + 2000);
  const glasses = Math.ceil(recommendedMl / 250);
  const fillPercent = Math.min(100, (lastDurationMinutes / 60) * 100);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Hydration</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Water glass visual */}
        <div className="relative w-12 h-16 border-2 border-blue-400/40 rounded-b-lg overflow-hidden flex-shrink-0">
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-400/30 transition-all duration-1000"
            style={{ height: `${fillPercent}%` }}
          />
          <Droplets className="absolute inset-0 m-auto w-5 h-5 text-blue-400/60" />
        </div>

        <div>
          <div className="text-2xl font-bold font-mono text-foreground">{recommendedMl}ml</div>
          <div className="text-xs text-muted-foreground">≈ {glasses} glasses today</div>
          {lastSession && (
            <div className="text-xs text-muted-foreground mt-1">
              Based on {Math.floor(lastDurationMinutes)}min workout
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        💡 Drink 500ml per 30 minutes of activity. Stay hydrated for peak performance!
      </div>
    </div>
  );
}

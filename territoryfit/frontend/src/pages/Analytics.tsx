import React, { useMemo, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWorkoutSessions } from '../hooks/useQueries';
import { ProgressChart } from '../components/analytics/ProgressChart';
import { PersonalBests } from '../components/analytics/PersonalBests';
import { GoalTracker } from '../components/analytics/GoalTracker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WorkoutSession } from '../backend';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function buildChartData(sessions: WorkoutSession[], days: number, metric: 'distance' | 'calories') {
  const data: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStr = d.toDateString();
    const dayTotal = sessions
      .filter(s => new Date(Number(s.timestamp) / 1_000_000).toDateString() === dayStr)
      .reduce((sum, s) => sum + Number(metric === 'distance' ? s.distanceKm : s.caloriesBurned), 0);
    data.push({ date: dateStr, value: dayTotal });
  }
  return data;
}

function getTrend(current: number, previous: number): { pct: number; dir: 'up' | 'down' | 'same' } {
  if (previous === 0) return { pct: 0, dir: 'same' };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'same' };
}

export function AnalyticsPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: sessions = [], isLoading } = useWorkoutSessions(principal);
  const [range, setRange] = useState<'7' | '30'>('7');

  const days = parseInt(range);

  const distData = useMemo(() => buildChartData(sessions, days, 'distance'), [sessions, days]);
  const calData = useMemo(() => buildChartData(sessions, days, 'calories'), [sessions, days]);

  // Trend: this week vs last week
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekSessions = sessions.filter(s => now - Number(s.timestamp) / 1_000_000 < weekMs);
  const lastWeekSessions = sessions.filter(s => {
    const age = now - Number(s.timestamp) / 1_000_000;
    return age >= weekMs && age < 2 * weekMs;
  });

  const thisWeekDist = thisWeekSessions.reduce((s, w) => s + Number(w.distanceKm), 0);
  const lastWeekDist = lastWeekSessions.reduce((s, w) => s + Number(w.distanceKm), 0);
  const thisWeekCal = thisWeekSessions.reduce((s, w) => s + Number(w.caloriesBurned), 0);
  const lastWeekCal = lastWeekSessions.reduce((s, w) => s + Number(w.caloriesBurned), 0);

  const distTrend = getTrend(thisWeekDist, lastWeekDist);
  const calTrend = getTrend(thisWeekCal, lastWeekCal);

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to view analytics</div>;
  }

  const TrendIcon = ({ dir }: { dir: 'up' | 'down' | 'same' }) => {
    if (dir === 'up') return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
    if (dir === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {(['7', '30'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                range === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Distance (this week)</span>
            <div className="flex items-center gap-1">
              <TrendIcon dir={distTrend.dir} />
              <span className="text-xs font-mono text-muted-foreground">{distTrend.pct}%</span>
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{thisWeekDist} km</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Calories (this week)</span>
            <div className="flex items-center gap-1">
              <TrendIcon dir={calTrend.dir} />
              <span className="text-xs font-mono text-muted-foreground">{calTrend.pct}%</span>
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{thisWeekCal} cal</div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Distance (km)</div>
        <ProgressChart data={distData} metric="distance" type="bar" />
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Calories Burned</div>
        <ProgressChart data={calData} metric="calories" type="line" />
      </div>

      {/* Goals */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Daily Goals</div>
        <GoalTracker sessions={sessions} />
      </div>

      {/* Personal Bests */}
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Personal Bests</div>
        <PersonalBests sessions={sessions} />
      </div>
    </div>
  );
}

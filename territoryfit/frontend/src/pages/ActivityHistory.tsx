import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWorkoutSessions } from '../hooks/useQueries';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '../utils/gamification';
import { WorkoutSession } from '../backend';

function groupByDay(sessions: WorkoutSession[]) {
  const groups: Record<string, WorkoutSession[]> = {};
  sessions.forEach(s => {
    const d = new Date(Number(s.timestamp) / 1_000_000).toDateString();
    if (!groups[d]) groups[d] = [];
    groups[d].push(s);
  });
  return groups;
}

function groupByWeek(sessions: WorkoutSession[]) {
  const groups: Record<string, WorkoutSession[]> = {};
  sessions.forEach(s => {
    const d = new Date(Number(s.timestamp) / 1_000_000);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = `Week of ${weekStart.toLocaleDateString()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return groups;
}

function groupByMonth(sessions: WorkoutSession[]) {
  const groups: Record<string, WorkoutSession[]> = {};
  sessions.forEach(s => {
    const d = new Date(Number(s.timestamp) / 1_000_000);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return groups;
}

export function ActivityHistoryPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: sessions = [], isLoading } = useWorkoutSessions(principal);
  const [tab, setTab] = useState('day');

  const sorted = [...sessions].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const groups = tab === 'day' ? groupByDay(sorted) : tab === 'week' ? groupByWeek(sorted) : groupByMonth(sorted);

  if (!identity) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Login to view your activity history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Activity History</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary w-full">
          <TabsTrigger value="day" className="flex-1">Day</TabsTrigger>
          <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
          <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No workouts yet. Start your first session!
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groups).map(([period, periodSessions]) => {
                const totalDist = periodSessions.reduce((s, w) => s + Number(w.distanceKm), 0);
                const totalCal = periodSessions.reduce((s, w) => s + Number(w.caloriesBurned), 0);
                const totalDur = periodSessions.reduce((s, w) => s + Number(w.durationSeconds), 0);
                return (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{period}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {totalDist}km · {totalCal}cal · {formatDuration(totalDur)}
                      </span>
                    </div>
                    <ActivityFeed
                      items={periodSessions.map(s => ({ session: s, userName: 'You' }))}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

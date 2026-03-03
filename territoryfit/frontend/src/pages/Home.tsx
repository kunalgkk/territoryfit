import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useWorkoutSessions } from '../hooks/useQueries';
import { WorkoutRecorder } from '../components/tracking/WorkoutRecorder';
import { DailyChallengeCard } from '../components/gamification/DailyChallengeCard';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { Zap, MapPin, Activity } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function HomePage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: sessions = [] } = useWorkoutSessions(principal);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <img
          src="/assets/generated/app-icon.dim_256x256.png"
          alt="TerritoryFit"
          className="w-20 h-20 rounded-2xl mb-6 shadow-xl"
        />
        <h1 className="text-3xl font-bold text-foreground mb-3">TerritoryFit</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
          Capture real-world territories through fitness. Walk, run, cycle — and dominate the map.
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          {[
            { icon: Activity, label: 'Track Fitness' },
            { icon: MapPin, label: 'Claim Zones' },
            { icon: Zap, label: 'Earn XP' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-3 text-center">
              <Icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Login to start your journey</p>
      </div>
    );
  }

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => {
    const d = new Date(Number(s.timestamp) / 1_000_000);
    return d.toDateString() === today;
  });
  const todayDistance = todaySessions.reduce((sum, s) => sum + Number(s.distanceKm), 0);
  const todayCalories = todaySessions.reduce((sum, s) => sum + Number(s.caloriesBurned), 0);

  const feedItems = sessions.slice(-20).reverse().map(s => ({
    session: s,
    userName: 'You',
  }));

  return (
    <div className="space-y-6">
      {/* Today's Quick Stats */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Today</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">Distance</div>
            <div className="text-2xl font-bold font-mono text-foreground">{todayDistance.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-1">Calories</div>
            <div className="text-2xl font-bold font-mono text-foreground">{todayCalories}</div>
            <div className="text-xs text-muted-foreground">kcal</div>
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <DailyChallengeCard sessions={sessions} />

      {/* Quick Workout */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Log Workout</h2>
        <div className="bg-card rounded-xl border border-border p-4">
          <WorkoutRecorder />
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Recent Activity</h2>
          <button
            onClick={() => navigate({ to: '/activity' })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </button>
        </div>
        <ActivityFeed items={feedItems.slice(0, 5)} emptyMessage="No workouts yet. Start your first session!" />
      </div>
    </div>
  );
}

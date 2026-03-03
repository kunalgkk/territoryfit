import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useFitnessProfile, useWorkoutSessions } from '../hooks/useQueries';
import { WorkoutRoutineCard } from '../components/coach/WorkoutRoutineCard';
import { MealPlanCard } from '../components/coach/MealPlanCard';
import { HydrationReminder } from '../components/coach/HydrationReminder';
import { UpgradePrompt } from '../components/subscription/UpgradePrompt';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { Brain } from 'lucide-react';

export function AICoachPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: profile } = useFitnessProfile();
  const { data: sessions = [] } = useWorkoutSessions(principal);
  const { flags } = useFeatureFlags();

  const tier = (localStorage.getItem('subscriptionTier') as string) || 'free';
  const hasAccess = (tier === 'pro' || tier === 'elite') && flags.aiCoachEnabled;

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to access AI Coach</div>;
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">AI Coach</h1>
        </div>
        <UpgradePrompt feature="ai_coach" requiredTier="Pro" />
      </div>
    );
  }

  const goal = profile?.primaryGoal || 'general_fitness';
  const weightKg = profile ? Number(profile.weightKg) : 70;
  const age = profile ? Number(profile.age) : 25;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Coach</h1>
          <p className="text-xs text-muted-foreground">Personalized for your {goal.replace(/_/g, ' ')} goal</p>
        </div>
      </div>

      <WorkoutRoutineCard goal={goal} />
      <MealPlanCard weightKg={weightKg} age={age} goal={goal} />
      <HydrationReminder sessions={sessions} />

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Recovery Tips</div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>💤 Aim for 7-9 hours of sleep for optimal muscle recovery</div>
          <div>🧘 Include 10-15 min stretching after each workout</div>
          <div>🛁 Cold/contrast showers can reduce muscle soreness</div>
          <div>📅 Take at least 1-2 rest days per week</div>
        </div>
      </div>
    </div>
  );
}

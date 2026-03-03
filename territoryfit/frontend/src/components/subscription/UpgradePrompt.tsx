import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { Feature } from '../../utils/subscriptionGating';

interface UpgradePromptProps {
  feature: Feature;
  requiredTier?: string;
}

const FEATURE_LABELS: Record<Feature, string> = {
  ai_coach: 'AI Fitness Coach',
  advanced_analytics: 'Advanced Analytics',
  no_ads: 'Ad-Free Experience',
  territory_boost: 'Territory Power Boost',
  team_battles: 'Team Battles',
  iap_store: 'In-App Store',
};

export function UpgradePrompt({ feature, requiredTier = 'Pro' }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{FEATURE_LABELS[feature]}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Upgrade to <strong className="text-foreground">{requiredTier}</strong> to unlock this feature and take your fitness game to the next level.
      </p>
      <Button onClick={() => navigate({ to: '/subscription' })} className="gap-2">
        Upgrade Now <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

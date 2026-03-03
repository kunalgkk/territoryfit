import React from 'react';
import { SubscriptionTier } from '../../utils/subscriptionGating';
import { Crown, Star, Zap, User } from 'lucide-react';

interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md';
}

const TIER_CONFIG = {
  free: { label: 'Free', icon: User, color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
  premium: { label: 'Premium', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  pro: { label: 'Pro', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  elite: { label: 'Elite', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
};

export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${config.bg}`}>
      <Icon className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} ${config.color}`} />
      <span className={`font-mono font-bold ${config.color} ${isSmall ? 'text-xs' : 'text-sm'}`}>
        {config.label}
      </span>
    </div>
  );
}

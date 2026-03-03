export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'elite';

export type Feature =
  | 'ai_coach'
  | 'advanced_analytics'
  | 'no_ads'
  | 'territory_boost'
  | 'team_battles'
  | 'iap_store';

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  pro: 2,
  elite: 3,
};

const FEATURE_REQUIREMENTS: Record<Feature, number> = {
  no_ads: 1,
  advanced_analytics: 2,
  ai_coach: 2,
  team_battles: 1,
  iap_store: 0,
  territory_boost: 3,
};

export function getTierLevel(tier: SubscriptionTier): number {
  return TIER_LEVELS[tier] ?? 0;
}

export function hasFeatureAccess(tier: SubscriptionTier, feature: Feature): boolean {
  return getTierLevel(tier) >= (FEATURE_REQUIREMENTS[feature] ?? 0);
}

export function requiresUpgrade(currentTier: SubscriptionTier, feature: Feature): boolean {
  return !hasFeatureAccess(currentTier, feature);
}

export const TIER_BENEFITS: Record<SubscriptionTier, string[]> = {
  free: ['Basic fitness tracking', 'Territory game access', 'Global leaderboard', 'Ad-supported'],
  premium: ['Everything in Free', 'No advertisements', 'Team battles', 'Priority support'],
  pro: ['Everything in Premium', 'Advanced analytics', 'AI fitness coach', 'Diet & meal plans'],
  elite: ['Everything in Pro', '2x territory power', 'Exclusive cosmetics', 'Season rewards'],
};

export const TIER_PRICES: Record<SubscriptionTier, { monthly: string; yearly: string }> = {
  free: { monthly: '$0', yearly: '$0' },
  premium: { monthly: '$4.99', yearly: '$39.99' },
  pro: { monthly: '$9.99', yearly: '$79.99' },
  elite: { monthly: '$19.99', yearly: '$159.99' },
};

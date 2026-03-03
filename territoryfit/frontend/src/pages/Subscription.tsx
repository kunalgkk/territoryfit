import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { TierBadge } from '../components/subscription/TierBadge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Star, Zap, User } from 'lucide-react';
import { SubscriptionTier, TIER_BENEFITS, TIER_PRICES } from '../utils/subscriptionGating';
import { toast } from 'sonner';

const TIERS: { id: SubscriptionTier; label: string; icon: React.ReactNode; highlight?: boolean }[] = [
  { id: 'free', label: 'Free', icon: <User className="w-4 h-4" /> },
  { id: 'premium', label: 'Premium', icon: <Star className="w-4 h-4" /> },
  { id: 'pro', label: 'Pro', icon: <Zap className="w-4 h-4" />, highlight: true },
  { id: 'elite', label: 'Elite', icon: <Crown className="w-4 h-4" /> },
];

export function SubscriptionPage() {
  const { identity } = useInternetIdentity();
  const currentTier = (localStorage.getItem('subscriptionTier') as SubscriptionTier) || 'free';

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      localStorage.setItem('subscriptionTier', 'free');
      toast.success('Downgraded to Free tier');
      return;
    }
    // In a real app, this would go through Stripe
    localStorage.setItem('subscriptionTier', tier);
    toast.success(`Upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}! (Demo mode)`);
    window.location.reload();
  };

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to manage subscription</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Subscription</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">Current plan:</span>
          <TierBadge tier={currentTier} />
        </div>
      </div>

      <div className="space-y-3">
        {TIERS.map(({ id, label, icon, highlight }) => {
          const isCurrent = id === currentTier;
          const prices = TIER_PRICES[id];
          const benefits = TIER_BENEFITS[id];

          return (
            <div
              key={id}
              className={`rounded-xl border p-4 transition-all ${
                highlight
                  ? 'border-white/30 bg-white/5'
                  : isCurrent
                  ? 'border-border bg-card'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TierBadge tier={id} size="md" />
                  {highlight && (
                    <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full font-mono">Popular</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-foreground">{prices.monthly}</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {benefits.map(b => (
                  <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-foreground flex-shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <div className="text-center text-xs font-mono text-muted-foreground py-2 border border-border rounded-lg">
                  Current Plan
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant={highlight ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpgrade(id)}
                >
                  {id === 'free' ? 'Downgrade' : `Upgrade to ${label}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Subscription changes are in demo mode. Real payments require Stripe configuration.
      </p>
    </div>
  );
}

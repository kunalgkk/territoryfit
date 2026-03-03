import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { StoreItemCard } from '../components/store/StoreItemCard';
import { StripeConfigSetup } from '../components/store/StripeConfigSetup';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { UpgradePrompt } from '../components/subscription/UpgradePrompt';
import { ShoppingBag } from 'lucide-react';

const STORE_ITEMS = [
  {
    id: 'territory_booster',
    name: 'Territory Booster',
    description: '2x zone pass multiplier for 24 hours. Dominate the map faster!',
    price: '$4.99',
    priceInCents: 499,
    icon: '🚀',
    category: 'Booster',
  },
  {
    id: 'xp_multiplier',
    name: 'XP Multiplier',
    description: 'Double your XP earnings for 24 hours. Level up faster!',
    price: '$2.99',
    priceInCents: 299,
    icon: '⚡',
    category: 'Booster',
  },
  {
    id: 'zone_defense',
    name: 'Zone Defense',
    description: 'Protect your zone from takeover for 12 hours.',
    price: '$3.99',
    priceInCents: 399,
    icon: '🛡️',
    category: 'Power-up',
  },
  {
    id: 'skin_red',
    name: 'Crimson Theme',
    description: 'Exclusive red territory color theme for your zones.',
    price: '$1.99',
    priceInCents: 199,
    icon: '🎨',
    category: 'Cosmetic',
  },
  {
    id: 'skin_gold',
    name: 'Gold Theme',
    description: 'Exclusive gold territory color theme. Show your elite status.',
    price: '$1.99',
    priceInCents: 199,
    icon: '✨',
    category: 'Cosmetic',
  },
  {
    id: 'ai_credits',
    name: 'AI Credits Pack',
    description: '100 AI coaching credits for personalized recommendations.',
    price: '$5.99',
    priceInCents: 599,
    icon: '🧠',
    category: 'Credits',
  },
];

export function StorePage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { flags } = useFeatureFlags();

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to access the store</div>;
  }

  if (!flags.iapStoreEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Store</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground text-sm">
          The store is currently disabled by the administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Store</h1>
      </div>

      {isAdmin && (
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Admin: Payment Setup</div>
          <StripeConfigSetup />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {STORE_ITEMS.map(item => (
          <StoreItemCard key={item.id} item={item} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Purchases are processed securely via Stripe. Items are delivered instantly.
      </p>
    </div>
  );
}

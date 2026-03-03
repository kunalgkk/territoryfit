import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ProfileDashboard } from '../components/profile/ProfileDashboard';
import { LoginButton } from '../components/auth/LoginButton';
import { SubscriptionTier } from '../utils/subscriptionGating';
import { User } from 'lucide-react';

export function ProfilePage() {
  const { identity } = useInternetIdentity();
  const tier = (localStorage.getItem('subscriptionTier') as SubscriptionTier) || 'free';

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <div className="text-sm font-semibold text-foreground mb-2">Not logged in</div>
        <div className="text-xs text-muted-foreground mb-6">Login to view your profile</div>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>
      <ProfileDashboard tier={tier} />

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Principal ID</div>
        <div className="text-xs font-mono text-muted-foreground break-all">
          {identity.getPrincipal().toString()}
        </div>
      </div>
    </div>
  );
}

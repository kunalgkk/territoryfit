import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { UpgradePrompt } from '../components/subscription/UpgradePrompt';

export function TeamsPage() {
  const { identity } = useInternetIdentity();
  const { flags } = useFeatureFlags();
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const tier = (localStorage.getItem('subscriptionTier') as string) || 'free';
  const hasAccess = tier !== 'free' && flags.teamBattlesEnabled;

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to join teams</div>;
  }

  if (!hasAccess) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Teams</h1>
        </div>
        <UpgradePrompt feature="team_battles" requiredTier="Premium" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Teams</h1>
      </div>

      <div className="grid gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Team
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Team Name</Label>
            <Input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Enter team name..."
              className="bg-input border-border text-foreground mt-1"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => toast.info('Team creation requires backend support')}
            disabled={!teamName.trim()}
          >
            Create Team
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Join Team
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Team Code</Label>
            <Input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter invite code..."
              className="bg-input border-border text-foreground mt-1"
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.info('Team joining requires backend support')}
            disabled={!joinCode.trim()}
          >
            Join Team
          </Button>
        </div>
      </div>

      <div className="text-center py-8">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <div className="text-sm text-muted-foreground">You're not in any team yet</div>
      </div>
    </div>
  );
}

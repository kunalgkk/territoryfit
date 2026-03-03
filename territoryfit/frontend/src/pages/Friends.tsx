import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';

export function FriendsPage() {
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to manage friends</div>;
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    toast.info('Friend search requires backend user directory support');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Friends</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by username..."
          className="bg-input border-border text-foreground"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} size="icon" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <div className="text-sm font-semibold text-foreground mb-2">No friends yet</div>
        <div className="text-xs text-muted-foreground max-w-xs mx-auto">
          Search for other players by their username to add them as friends and see their activity.
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">Your Principal ID</div>
        <div className="text-xs font-mono text-muted-foreground break-all">
          {identity.getPrincipal().toString()}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(identity.getPrincipal().toString());
            toast.success('Copied to clipboard!');
          }}
        >
          Copy ID to share
        </Button>
      </div>
    </div>
  );
}

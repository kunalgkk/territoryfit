import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { WorkoutSession } from '../../backend';

interface ShareActivityButtonProps {
  session: WorkoutSession;
  userName: string;
}

export function ShareActivityButton({ session, userName }: ShareActivityButtonProps) {
  const handleShare = async () => {
    const text = `${userName} just logged a ${session.distanceKm}km ${session.activityType}${session.zone ? ` in ${session.zone.replace(/-/g, ' ')}` : ''} and earned XP! 🏃 #TerritoryFit`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1 text-muted-foreground hover:text-foreground">
      <Share2 className="w-3.5 h-3.5" />
      Share
    </Button>
  );
}

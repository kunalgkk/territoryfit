import React from 'react';
import { WorkoutSession } from '../../backend';
import { formatDuration } from '../../utils/gamification';
import { Activity, MapPin, Clock } from 'lucide-react';

interface FeedItem {
  session: WorkoutSession;
  userName: string;
}

interface ActivityFeedProps {
  items: FeedItem[];
  emptyMessage?: string;
}

export function ActivityFeed({ items, emptyMessage = 'No recent activity' }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const date = new Date(Number(item.session.timestamp) / 1_000_000);
        const timeAgo = getTimeAgo(date);

        return (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{item.userName[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.userName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.session.activityType}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-bold font-mono text-foreground">{String(item.session.distanceKm)} km</span>
                <span className="text-muted-foreground text-xs ml-1">dist</span>
              </div>
              <div>
                <span className="font-bold font-mono text-foreground">{formatDuration(Number(item.session.durationSeconds))}</span>
                <span className="text-muted-foreground text-xs ml-1">time</span>
              </div>
              <div>
                <span className="font-bold font-mono text-foreground">{String(item.session.caloriesBurned)}</span>
                <span className="text-muted-foreground text-xs ml-1">cal</span>
              </div>
            </div>

            {item.session.zone && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="capitalize">{item.session.zone.replace(/-/g, ' ')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

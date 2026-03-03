import React from 'react';
import { useZonePassCounts } from '../../hooks/useQueries';
import { getUserColor } from '../../utils/colorAssignment';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users } from 'lucide-react';

interface ZoneOwnershipCardProps {
  zoneName: string;
}

export function ZoneOwnershipCard({ zoneName }: ZoneOwnershipCardProps) {
  const { data: passCounts = [], isLoading } = useZonePassCounts(zoneName);

  const sorted = [...passCounts].sort((a, b) => Number(b[1]) - Number(a[1]));
  const owner = sorted[0];
  const challengers = sorted.slice(1, 6);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPinIcon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-bold text-foreground capitalize">{zoneName.replace(/-/g, ' ')}</span>
      </div>

      {owner ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Owner</span>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getUserColor(owner[0]) }}
            />
            <span className="text-xs font-mono text-foreground truncate">
              {owner[0].toString().slice(0, 12)}...
            </span>
            <span className="text-xs font-bold font-mono text-foreground ml-auto">{String(owner[1])} passes</span>
          </div>

          {challengers.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Challengers</span>
              </div>
              <div className="space-y-1">
                {challengers.map(([p, count]) => (
                  <div key={p.toString()} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUserColor(p) }} />
                    <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                      {p.toString().slice(0, 10)}...
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">Unclaimed territory</div>
      )}
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

import React, { useState } from 'react';
import { useTerritoryZones, useUserOwnedZones } from '../hooks/useQueries';
import { TerritoryMapGrid } from '../components/game/TerritoryMapGrid';
import { ZoneLegend } from '../components/game/ZoneLegend';
import { ZoneOwnershipCard } from '../components/game/ZoneOwnershipCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, MapPin } from 'lucide-react';

export function TerritoryMapPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: zones = [], isLoading, refetch, isFetching } = useTerritoryZones();
  const { data: ownedZones } = useUserOwnedZones(principal);
  const [selectedZone, setSelectedZone] = useState<string | undefined>();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Territory Map</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {principal ? `You own ${String(ownedZones ?? 0)} zone${Number(ownedZones ?? 0) !== 1 ? 's' : ''}` : 'Login to claim territories'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Map Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <TerritoryMapGrid
            zones={zones}
            currentUserPrincipal={principal}
            selectedZone={selectedZone}
            onZoneClick={setSelectedZone}
          />
        </div>
      )}

      {/* Legend */}
      {zones.length > 0 && <ZoneLegend zones={zones} />}

      {/* Selected Zone Detail */}
      {selectedZone && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Zone Details</span>
          </div>
          <ZoneOwnershipCard zoneName={selectedZone} />
        </div>
      )}

      {/* Instructions */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">How to Capture</div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex gap-2"><span>1.</span><span>Log a workout and select a territory zone</span></div>
          <div className="flex gap-2"><span>2.</span><span>Each workout pass increases your count for that zone</span></div>
          <div className="flex gap-2"><span>3.</span><span>Exceed the current owner's count to capture the zone</span></div>
          <div className="flex gap-2"><span>4.</span><span>Defend your zones by logging more workouts there</span></div>
        </div>
      </div>
    </div>
  );
}

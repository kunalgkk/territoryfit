import React, { useMemo } from 'react';
import { PublicTerritoryZone } from '../../backend';
import { getUserColor } from '../../utils/colorAssignment';
import { Principal } from '@dfinity/principal';

interface TerritoryMapGridProps {
  zones: Array<[string, PublicTerritoryZone]>;
  currentUserPrincipal?: Principal;
  selectedZone?: string;
  onZoneClick?: (zoneName: string) => void;
}

const ZONE_DISPLAY_NAMES: Record<string, string> = {
  'central-park': 'Central Park',
  'beach-boulevard': 'Beach Blvd',
  'mountain-trail': 'Mountain Trail',
  'riverside-route': 'Riverside',
};

export function TerritoryMapGrid({ zones, currentUserPrincipal, selectedZone, onZoneClick }: TerritoryMapGridProps) {
  const zoneMap = useMemo(() => {
    const map = new Map<string, PublicTerritoryZone>();
    zones.forEach(([name, data]) => map.set(name, data));
    return map;
  }, [zones]);

  const allZoneNames = ['central-park', 'beach-boulevard', 'mountain-trail', 'riverside-route'];

  const getZoneColor = (zoneName: string): string => {
    const zone = zoneMap.get(zoneName);
    if (!zone) return '#1a1a1a';
    const ownerStr = zone.currentOwner.toString();
    if (ownerStr === '2vxsx-fae') return '#1a1a1a'; // anonymous
    return getUserColor(zone.currentOwner);
  };

  const isContested = (zoneName: string): boolean => {
    const zone = zoneMap.get(zoneName);
    if (!zone || zone.passCounts.length < 2) return false;
    const sorted = [...zone.passCounts].sort((a, b) => Number(b[1]) - Number(a[1]));
    if (sorted.length < 2) return false;
    const top = Number(sorted[0][1]);
    const second = Number(sorted[1][1]);
    return top > 0 && second / top >= 0.7;
  };

  const isOwnedByUser = (zoneName: string): boolean => {
    if (!currentUserPrincipal) return false;
    const zone = zoneMap.get(zoneName);
    if (!zone) return false;
    return zone.currentOwner.toString() === currentUserPrincipal.toString();
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 p-4">
        {allZoneNames.map(zoneName => {
          const color = getZoneColor(zoneName);
          const contested = isContested(zoneName);
          const owned = isOwnedByUser(zoneName);
          const selected = selectedZone === zoneName;
          const zone = zoneMap.get(zoneName);
          const hasOwner = zone && zone.currentOwner.toString() !== '2vxsx-fae';

          return (
            <button
              key={zoneName}
              onClick={() => onZoneClick?.(zoneName)}
              className="relative rounded-xl overflow-hidden aspect-square transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: hasOwner ? `${color}33` : '#1a1a1a',
                border: selected
                  ? `3px solid ${color || '#ffffff'}`
                  : owned
                  ? `2px solid ${color}`
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: owned ? `0 0 20px ${color}44` : 'none',
              }}
            >
              {/* Color fill */}
              {hasOwner && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: color }}
                />
              )}

              {/* Contested pulse */}
              {contested && (
                <div
                  className="absolute inset-0 animate-pulse-border rounded-xl"
                  style={{ border: `2px solid ${color}` }}
                />
              )}

              {/* Zone content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-3">
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: hasOwner ? color : '#333' }}
                />
                <div className="text-xs font-bold text-white text-center leading-tight">
                  {ZONE_DISPLAY_NAMES[zoneName] || zoneName}
                </div>
                {zone && (
                  <div className="text-xs text-white/50 mt-1 font-mono">
                    {zone.passCounts.length} player{zone.passCounts.length !== 1 ? 's' : ''}
                  </div>
                )}
                {contested && (
                  <div className="text-xs text-yellow-400 mt-1 font-mono">⚔ Contested</div>
                )}
                {owned && (
                  <div className="text-xs text-white/70 mt-1">★ Yours</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

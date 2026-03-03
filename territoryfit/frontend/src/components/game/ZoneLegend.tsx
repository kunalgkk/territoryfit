import React from 'react';
import { PublicTerritoryZone } from '../../backend';
import { getUserColor } from '../../utils/colorAssignment';

interface ZoneLegendProps {
  zones: Array<[string, PublicTerritoryZone]>;
}

export function ZoneLegend({ zones }: ZoneLegendProps) {
  const ownerMap = new Map<string, { color: string; count: number }>();

  zones.forEach(([, zone]) => {
    const ownerStr = zone.currentOwner.toString();
    if (ownerStr === '2vxsx-fae') return;
    const color = getUserColor(zone.currentOwner);
    const existing = ownerMap.get(ownerStr);
    ownerMap.set(ownerStr, { color, count: (existing?.count ?? 0) + 1 });
  });

  const owners = Array.from(ownerMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (owners.length === 0) return null;

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-xl border border-white/10 p-3">
      <div className="text-xs uppercase tracking-widest text-white/50 font-mono mb-2">Territory Owners</div>
      <div className="space-y-1.5">
        {owners.map(([principal, { color, count }]) => (
          <div key={principal} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-white/70 font-mono truncate flex-1">
              {principal.slice(0, 8)}...
            </span>
            <span className="text-xs font-bold font-mono text-white">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

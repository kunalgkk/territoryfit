import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useTerritoryZones } from '../hooks/useQueries';
import { StripeConfigSetup } from '../components/store/StripeConfigSetup';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Users, Map, Flag, DollarSign } from 'lucide-react';
import { PublicTerritoryZone } from '../backend';
import { getUserColor } from '../utils/colorAssignment';

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: zones = [], isLoading: zonesLoading } = useTerritoryZones();
  const { flags, setFlag } = useFeatureFlags();

  if (!identity) {
    return <div className="text-center py-16 text-muted-foreground">Login to access admin panel</div>;
  }

  if (adminLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <div className="text-sm font-semibold text-foreground mb-2">Access Denied</div>
        <div className="text-xs text-muted-foreground">You don't have admin privileges</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
      </div>

      <Tabs defaultValue="territory">
        <TabsList className="bg-secondary w-full grid grid-cols-4">
          <TabsTrigger value="territory" className="text-xs"><Map className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="flags" className="text-xs"><Flag className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs"><DollarSign className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="users" className="text-xs"><Users className="w-3.5 h-3.5" /></TabsTrigger>
        </TabsList>

        {/* Territory Monitor */}
        <TabsContent value="territory" className="mt-4 space-y-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Territory Monitor</div>
          {zonesLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : zones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No zones claimed yet</div>
          ) : (
            <div className="space-y-2">
              {zones.map(([zoneName, zone]: [string, PublicTerritoryZone]) => {
                const sorted = [...zone.passCounts].sort((a, b) => Number(b[1]) - Number(a[1]));
                const ownerStr = zone.currentOwner.toString();
                const isAnon = ownerStr === '2vxsx-fae';
                const color = isAnon ? '#333' : getUserColor(zone.currentOwner);
                const isContested = sorted.length >= 2 && Number(sorted[1][1]) / Number(sorted[0][1]) >= 0.7;

                return (
                  <div key={zoneName} className="bg-card rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {zoneName.replace(/-/g, ' ')}
                        </span>
                        {isContested && (
                          <span className="text-xs text-yellow-400 font-mono">⚔ Contested</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {zone.passCounts.length} player{zone.passCounts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {!isAnon && (
                      <div className="text-xs font-mono text-muted-foreground">
                        Owner: {ownerStr.slice(0, 16)}...
                      </div>
                    )}
                    {sorted.slice(0, 3).map(([p, count]) => (
                      <div key={p.toString()} className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUserColor(p) }} />
                        <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                          {p.toString().slice(0, 12)}...
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="flags" className="mt-4 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Feature Flags</div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {[
              { key: 'aiCoachEnabled' as const, label: 'AI Coach', description: 'Enable AI fitness coaching feature' },
              { key: 'teamBattlesEnabled' as const, label: 'Team Battles', description: 'Enable team territory battles' },
              { key: 'iapStoreEnabled' as const, label: 'IAP Store', description: 'Enable in-app purchase store' },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground">{label}</Label>
                  <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                </div>
                <Switch
                  checked={flags[key]}
                  onCheckedChange={v => setFlag(key, v)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Revenue Dashboard</div>
          <StripeConfigSetup />
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-xs text-muted-foreground mb-3">Transaction Summary</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-foreground">$0</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">User Management</div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground text-center py-4">
              User management requires a backend user directory endpoint.
              Currently showing territory zone owners only.
            </div>
            {zones.length > 0 && (
              <div className="space-y-2 mt-4">
                {Array.from(new Set(
                  zones
                    .map(([, z]: [string, PublicTerritoryZone]) => z.currentOwner.toString())
                    .filter(p => p !== '2vxsx-fae')
                )).map(pid => (
                  <div key={pid} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getUserColor(pid) }} />
                    <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{pid}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTerritoryZones, useWorkoutSessions } from '../hooks/useQueries';
import { LeaderboardTable, LeaderboardEntry } from '../components/leaderboard/LeaderboardTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import { PublicTerritoryZone } from '../backend';

export function LeaderboardPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const [tab, setTab] = useState('territory');

  const { data: zones = [], isLoading: zonesLoading } = useTerritoryZones();
  const { data: mySessions = [] } = useWorkoutSessions(principal);

  // Build territory leaderboard from zone data
  const territoryEntries = useMemo((): LeaderboardEntry[] => {
    const ownerMap = new Map<string, number>();
    zones.forEach(([, zone]: [string, PublicTerritoryZone]) => {
      const ownerStr = zone.currentOwner.toString();
      if (ownerStr === '2vxsx-fae') return;
      ownerMap.set(ownerStr, (ownerMap.get(ownerStr) ?? 0) + 1);
    });

    return Array.from(ownerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([pid, count], i) => ({
        rank: i + 1,
        principalId: pid,
        name: pid.slice(0, 8) + '...',
        value: count,
        unit: 'zones',
        isCurrentUser: pid === principal?.toString(),
      }));
  }, [zones, principal]);

  // Build distance leaderboard from own sessions (limited data)
  const myTotalDistance = mySessions.reduce((s, w) => s + Number(w.distanceKm), 0);
  const myTotalCalories = mySessions.reduce((s, w) => s + Number(w.caloriesBurned), 0);

  const myDistEntry: LeaderboardEntry | undefined = principal ? {
    rank: 1,
    principalId: principal.toString(),
    name: 'You',
    value: myTotalDistance,
    unit: 'km',
    isCurrentUser: true,
  } : undefined;

  const myCalEntry: LeaderboardEntry | undefined = principal ? {
    rank: 1,
    principalId: principal.toString(),
    name: 'You',
    value: myTotalCalories,
    unit: 'cal',
    isCurrentUser: true,
  } : undefined;

  const isLoading = zonesLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold text-foreground">Leaderboard</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary w-full">
          <TabsTrigger value="territory" className="flex-1 text-xs">Territory</TabsTrigger>
          <TabsTrigger value="distance" className="flex-1 text-xs">Distance</TabsTrigger>
          <TabsTrigger value="calories" className="flex-1 text-xs">Calories</TabsTrigger>
        </TabsList>

        <TabsContent value="territory" className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : territoryEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No territories claimed yet. Be the first!
            </div>
          ) : (
            <LeaderboardTable
              entries={territoryEntries}
              currentUserEntry={territoryEntries.find(e => e.isCurrentUser)}
            />
          )}
        </TabsContent>

        <TabsContent value="distance" className="mt-4">
          {myDistEntry ? (
            <LeaderboardTable entries={[myDistEntry]} currentUserEntry={myDistEntry} />
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Login to see your ranking</div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Global distance rankings require all users to share data publicly.
          </p>
        </TabsContent>

        <TabsContent value="calories" className="mt-4">
          {myCalEntry ? (
            <LeaderboardTable entries={[myCalEntry]} currentUserEntry={myCalEntry} />
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">Login to see your ranking</div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Global calorie rankings require all users to share data publicly.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

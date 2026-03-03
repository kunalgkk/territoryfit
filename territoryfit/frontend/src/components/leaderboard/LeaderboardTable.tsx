import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface LeaderboardEntry {
  rank: number;
  principalId: string;
  name: string;
  value: number;
  unit: string;
  isCurrentUser: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
}

export function LeaderboardTable({ entries, currentUserEntry }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="space-y-1">
      {entries.map(entry => (
        <div
          key={entry.principalId}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            entry.isCurrentUser
              ? 'bg-primary/10 border border-primary/20'
              : 'bg-card border border-border hover:bg-secondary/50'
          }`}
        >
          <div className="w-8 text-center flex-shrink-0">
            {getRankIcon(entry.rank) ? (
              <span className="text-lg">{getRankIcon(entry.rank)}</span>
            ) : (
              <span className="text-sm font-bold font-mono text-muted-foreground">#{entry.rank}</span>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-foreground">{entry.name[0]?.toUpperCase() ?? '?'}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {entry.name}
              {entry.isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold font-mono text-foreground">
              {entry.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{entry.unit}</div>
          </div>
        </div>
      ))}

      {currentUserEntry && !entries.find(e => e.isCurrentUser) && (
        <>
          <div className="text-center text-xs text-muted-foreground py-2">• • •</div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-8 text-center">
              <span className="text-sm font-bold font-mono text-muted-foreground">#{currentUserEntry.rank}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{currentUserEntry.name[0]?.toUpperCase() ?? '?'}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{currentUserEntry.name} <span className="text-xs text-muted-foreground">(you)</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-foreground">{currentUserEntry.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{currentUserEntry.unit}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

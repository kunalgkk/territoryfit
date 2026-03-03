import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getLevelFromXP, getXPProgressInLevel } from '../../utils/gamification';

interface LevelProgressBarProps {
  totalXP: number;
  compact?: boolean;
}

export function LevelProgressBar({ totalXP, compact = false }: LevelProgressBarProps) {
  const level = getLevelFromXP(totalXP);
  const { current, needed, percentage } = getXPProgressInLevel(totalXP);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">LVL</span>
        <span className="text-sm font-bold text-foreground">{level}</span>
        <div className="flex-1 min-w-0">
          <Progress value={percentage} className="h-1.5 bg-secondary" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{current}/{needed}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center">
            <span className="text-xs font-bold font-mono text-foreground">{level}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Level {level}</div>
            <div className="text-xs text-muted-foreground">{totalXP} total XP</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Next level</div>
          <div className="text-xs font-mono text-foreground">{current}/{needed} XP</div>
        </div>
      </div>
      <Progress value={percentage} className="h-2 bg-secondary" />
    </div>
  );
}

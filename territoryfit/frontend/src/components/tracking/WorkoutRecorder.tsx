import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecordWorkoutSession, useListZones, useFitnessProfile } from '../../hooks/useQueries';
import { useOverlay } from '../../contexts/OverlayContext';
import { calculateXP, calculateCalories, formatDuration, formatPace, getLevelFromXP } from '../../utils/gamification';
import { useWorkoutSessions } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Play, Square, Timer, MapPin, Zap, Flame } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TYPES = ['Running', 'Walking', 'Jogging', 'Cycling', 'Outdoor Workout'];

interface SessionSummaryData {
  activityType: string;
  duration: number;
  distance: number;
  calories: number;
  pace: string;
  xp: number;
  zone?: string;
}

interface WorkoutRecorderProps {
  onSessionComplete?: (summary: SessionSummaryData) => void;
}

export function WorkoutRecorder({ onSessionComplete }: WorkoutRecorderProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activityType, setActivityType] = useState('Running');
  const [distance, setDistance] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [lastSummary, setLastSummary] = useState<SessionSummaryData | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const { data: profile } = useFitnessProfile();
  const { data: zones = [] } = useListZones();
  const { data: sessions = [] } = useWorkoutSessions(principal);
  const recordSession = useRecordWorkoutSession();
  const { showXPGain, showLevelUp, showZoneCapture } = useOverlay();

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive]);

  const handleStart = () => {
    setElapsed(0);
    setLastSummary(null);
    setIsActive(true);
  };

  const handleStop = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const distKm = parseFloat(distance) || 0;
    const weightKg = profile ? Number(profile.weightKg) : 70;
    const calories = calculateCalories(activityType, elapsed, weightKg);
    const pace = formatPace(distKm, elapsed);

    const session = {
      activityType: activityType.toLowerCase(),
      durationSeconds: BigInt(elapsed),
      distanceKm: BigInt(Math.round(distKm)),
      caloriesBurned: BigInt(calories),
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      zone: selectedZone ? selectedZone : undefined,
    };

    try {
      await recordSession.mutateAsync(session);

      const xp = calculateXP(session);
      const prevXP = sessions.reduce((sum, s) => sum + calculateXP(s), 0);
      const newXP = prevXP + xp;
      const prevLevel = getLevelFromXP(prevXP);
      const newLevel = getLevelFromXP(newXP);

      showXPGain(xp);
      if (newLevel > prevLevel) showLevelUp(newLevel);
      if (selectedZone) showZoneCapture(selectedZone, '#ffffff');

      const summary: SessionSummaryData = {
        activityType,
        duration: elapsed,
        distance: distKm,
        calories,
        pace,
        xp,
        zone: selectedZone || undefined,
      };
      setLastSummary(summary);
      onSessionComplete?.(summary);
      setDistance('');
      setSelectedZone('');
      setElapsed(0);
      toast.success('Workout saved!');
    } catch {
      toast.error('Failed to save workout');
    }
  };

  const distKm = parseFloat(distance) || 0;
  const weightKg = profile ? Number(profile.weightKg) : 70;
  const liveCalories = isActive ? calculateCalories(activityType, elapsed, weightKg) : 0;
  const livePace = isActive && distKm > 0 ? formatPace(distKm, elapsed) : '--:--';

  return (
    <div className="space-y-4">
      {/* Activity Type */}
      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Activity</Label>
        <Select value={activityType} onValueChange={setActivityType} disabled={isActive}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {ACTIVITY_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zone Selector */}
      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Territory Zone</Label>
        <Select value={selectedZone} onValueChange={setSelectedZone} disabled={isActive}>
          <SelectTrigger className="bg-input border-border text-foreground">
            <SelectValue placeholder="Select zone (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="">No zone</SelectItem>
            {zones.map(z => (
              <SelectItem key={z} value={z}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="capitalize">{z.replace(/-/g, ' ')}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Distance Input */}
      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Distance (km)</Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          value={distance}
          onChange={e => setDistance(e.target.value)}
          placeholder="0.0"
          className="bg-input border-border text-foreground font-mono"
        />
      </div>

      {/* Timer Display */}
      <div className="bg-secondary rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Duration</span>
        </div>
        <div className="text-4xl font-bold font-mono text-foreground">{formatDuration(elapsed)}</div>
        {isActive && (
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span className="font-mono">{livePace} /km</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Flame className="w-3 h-3" />
              <span className="font-mono">{liveCalories} cal</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!isActive ? (
        <Button onClick={handleStart} className="w-full gap-2" size="lg">
          <Play className="w-5 h-5" />
          Start Workout
        </Button>
      ) : (
        <Button
          onClick={handleStop}
          variant="destructive"
          className="w-full gap-2"
          size="lg"
          disabled={recordSession.isPending}
        >
          {recordSession.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          Stop & Save
        </Button>
      )}

      {/* Last Session Summary */}
      {lastSummary && !isActive && (
        <div className="bg-card rounded-xl border border-border p-4 animate-slide-up">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Last Session</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Distance</div>
              <div className="font-bold font-mono text-foreground">{lastSummary.distance.toFixed(1)} km</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Duration</div>
              <div className="font-bold font-mono text-foreground">{formatDuration(lastSummary.duration)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Pace</div>
              <div className="font-bold font-mono text-foreground">{lastSummary.pace} /km</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Calories</div>
              <div className="font-bold font-mono text-foreground">{lastSummary.calories} cal</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">XP Earned</span>
            <span className="text-sm font-bold font-mono text-foreground">+{lastSummary.xp} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}

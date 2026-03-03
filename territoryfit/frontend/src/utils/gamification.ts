import { WorkoutSession } from '../backend';

export function calculateXP(session: WorkoutSession): number {
  const distanceKm = Number(session.distanceKm);
  const durationMinutes = Number(session.durationSeconds) / 60;
  return Math.floor(distanceKm * 10 + durationMinutes * 0.5);
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

export function getXPForLevel(level: number): number {
  return level * level * 100;
}

export function getXPForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1);
}

export function getXPProgressInLevel(totalXP: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForNextLevel(level);
  const current = totalXP - xpForCurrentLevel;
  const needed = xpForNextLevel - xpForCurrentLevel;
  const percentage = Math.min(100, Math.floor((current / needed) * 100));
  return { current, needed, percentage };
}

export function calculateCalories(
  activityType: string,
  durationSeconds: number,
  weightKg: number
): number {
  const durationHours = durationSeconds / 3600;
  const metValues: Record<string, number> = {
    running: 9.8,
    jogging: 7.0,
    walking: 3.5,
    cycling: 7.5,
    'outdoor workout': 5.0,
  };
  const met = metValues[activityType.toLowerCase()] || 5.0;
  return Math.floor(met * weightKg * durationHours);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatPace(distanceKm: number, durationSeconds: number): string {
  if (distanceKm === 0) return '--:--';
  const paceSeconds = durationSeconds / distanceKm;
  const m = Math.floor(paceSeconds / 60);
  const s = Math.floor(paceSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  { id: 'first_workout', name: 'First Step', description: 'Complete your first workout', icon: '👟', criteria: 'Complete 1 workout' },
  { id: 'first_capture', name: 'Territory Seeker', description: 'Capture your first zone', icon: '🏴', criteria: 'Capture 1 zone' },
  { id: 'territory_king', name: 'Territory King', description: 'Own 5 zones simultaneously', icon: '👑', criteria: 'Own 5 zones' },
  { id: 'marathon_runner', name: 'Marathon Runner', description: 'Log 42km total distance', icon: '🏃', criteria: 'Log 42km total' },
  { id: 'century_rider', name: 'Century Rider', description: 'Log 100km total distance', icon: '🚴', criteria: 'Log 100km total' },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Work out 7 days in a row', icon: '🔥', criteria: '7-day streak' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Run at pace under 5 min/km', icon: '⚡', criteria: 'Pace < 5:00/km' },
  { id: 'calorie_crusher', name: 'Calorie Crusher', description: 'Burn 1000 calories total', icon: '💪', criteria: 'Burn 1000 cal' },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 10 workouts', icon: '🌅', criteria: 'Complete 10 workouts' },
  { id: 'conqueror', name: 'Conqueror', description: 'Successfully take over a zone', icon: '⚔️', criteria: 'Take over 1 zone' },
];

export function checkBadgeUnlock(
  badgeId: string,
  stats: {
    totalWorkouts: number;
    totalDistanceKm: number;
    totalCalories: number;
    zonesOwned: number;
    bestPace?: number;
  }
): boolean {
  switch (badgeId) {
    case 'first_workout': return stats.totalWorkouts >= 1;
    case 'first_capture': return stats.zonesOwned >= 1;
    case 'territory_king': return stats.zonesOwned >= 5;
    case 'marathon_runner': return stats.totalDistanceKm >= 42;
    case 'century_rider': return stats.totalDistanceKm >= 100;
    case 'speed_demon': return (stats.bestPace ?? Infinity) < 300;
    case 'calorie_crusher': return stats.totalCalories >= 1000;
    case 'early_bird': return stats.totalWorkouts >= 10;
    case 'conqueror': return stats.zonesOwned >= 1;
    default: return false;
  }
}

import { Principal } from '@dfinity/principal';

const TERRITORY_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#f97316', // orange
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f43f5e', // rose
];

export function getUserColor(principal: Principal | string): string {
  const str = typeof principal === 'string' ? principal : principal.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % TERRITORY_COLORS.length;
  return TERRITORY_COLORS[index];
}

export function getColorName(color: string): string {
  const map: Record<string, string> = {
    '#ef4444': 'Red',
    '#3b82f6': 'Blue',
    '#22c55e': 'Green',
    '#a855f7': 'Purple',
    '#f97316': 'Orange',
    '#eab308': 'Yellow',
    '#06b6d4': 'Cyan',
    '#ec4899': 'Pink',
    '#14b8a6': 'Teal',
    '#f43f5e': 'Rose',
  };
  return map[color] || 'Unknown';
}

import type { Score } from '../core/leaderboard.js';
import { parseScores } from '../core/leaderboard.js';

export const STORAGE_KEY = 'bulls-and-cows:scores:v1';

export function loadScores(
  read: () => string | null = () => localStorage.getItem(STORAGE_KEY),
): Score[] {
  try {
    return parseScores(read());
  } catch {
    return [];
  }
}

export function saveScores(
  scores: readonly Score[],
  write: (value: string) => void = (value) => localStorage.setItem(STORAGE_KEY, value),
): boolean {
  try {
    write(JSON.stringify(scores));
    return true;
  } catch {
    return false;
  }
}

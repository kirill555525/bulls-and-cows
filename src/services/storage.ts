import type { Score } from '../core/leaderboard.js';

export const STORAGE_KEY = 'bulls-and-cows:scores:v1';

export function loadScores(
  read: () => string | null = () => localStorage.getItem(STORAGE_KEY),
): Score[] {
  void read;
  throw new Error('Not implemented');
}

export function saveScores(
  scores: readonly Score[],
  write: (value: string) => void = (value) => localStorage.setItem(STORAGE_KEY, value),
): boolean {
  void [scores, write];
  throw new Error('Not implemented');
}

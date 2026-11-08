import type { Settings } from './game.js';

export type Score = Readonly<Settings & { attempts: number; durationMs: number }>;
export const LEADERBOARD_LIMIT = 10;

export function rankScores(scores: readonly Score[], limit = LEADERBOARD_LIMIT): Score[] {
  void [scores, limit];
  throw new Error('Not implemented');
}

export function parseScores(raw: string | null): Score[] {
  void raw;
  throw new Error('Not implemented');
}

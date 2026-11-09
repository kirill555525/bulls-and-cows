import type { Settings } from './game.js';
import { isValidSettings } from './game.js';

export type Score = Readonly<Settings & { attempts: number; durationMs: number }>;
export const LEADERBOARD_LIMIT = 10;

export function rankScores(scores: readonly Score[], limit = LEADERBOARD_LIMIT): Score[] {
  return [...scores]
    .sort((a, b) => a.attempts - b.attempts || a.durationMs - b.durationMs)
    .slice(0, limit);
}

function isScore(value: unknown): value is Score {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.length === 'number' &&
    typeof entry.base === 'number' &&
    isValidSettings({ length: entry.length, base: entry.base }) &&
    typeof entry.attempts === 'number' &&
    Number.isSafeInteger(entry.attempts) &&
    entry.attempts > 0 &&
    typeof entry.durationMs === 'number' &&
    Number.isFinite(entry.durationMs) &&
    entry.durationMs >= 0
  );
}

export function parseScores(raw: string | null): Score[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return rankScores(
      parsed.filter(isScore).map(({ length, base, attempts, durationMs }) => ({
        length,
        base,
        attempts,
        durationMs,
      })),
    );
  } catch {
    return [];
  }
}

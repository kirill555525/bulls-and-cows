import type { Feedback } from './evaluate.js';

export const BASES: readonly number[] = [2, 8, 10, 16];
export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;
export type Settings = Readonly<{ length: number; base: number }>;
export type Attempt = Readonly<{ guess: string } & Feedback>;
export type GameState = Readonly<{
  settings: Settings;
  secret: string;
  history: readonly Attempt[];
  status: 'playing' | 'won';
  startedAt: number;
  finishedAt: number | null;
}>;
export type SubmitResult = Readonly<{
  state: GameState;
  error?: 'invalid' | 'duplicate' | 'finished';
}>;

export function isValidSettings(settings: Settings): boolean {
  void settings;
  throw new Error('Not implemented');
}

export function createGame(
  settings: Settings,
  secret: string,
  startedAt: number,
): GameState {
  void [settings, secret, startedAt];
  throw new Error('Not implemented');
}

export function submitGuess(state: GameState, guess: string, now: number): SubmitResult {
  void [state, guess, now];
  throw new Error('Not implemented');
}

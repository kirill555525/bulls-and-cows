import { describe, expect, it } from 'vitest';
import { createGame, isValidSettings, submitGuess } from '../src/core/game.js';

describe('game state', () => {
  it.each([
    [{ length: 2, base: 2 }, true],
    [{ length: 3, base: 2 }, false],
    [{ length: 6, base: 16 }, true],
    [{ length: 7, base: 16 }, false],
    [{ length: 4, base: 3 }, false],
    [{ length: 1, base: 10 }, false],
    [{ length: 2.5, base: 10 }, false],
  ])('validates settings %o', (settings, expected) => {
    expect(isValidSettings(settings)).toBe(expected);
  });

  it('creates an independent normalized game', () => {
    const settings = Object.freeze({ length: 4, base: 16 });
    const state = createGame(settings, 'AB09', 100);
    expect(state).toEqual({
      settings,
      secret: 'ab09',
      history: [],
      status: 'playing',
      startedAt: 100,
      finishedAt: null,
    });
    expect(state.settings).not.toBe(settings);
  });

  it('adds attempts without changing old arrays, entries or state', () => {
    const initial = Object.freeze(createGame({ length: 4, base: 10 }, '0123', 100));
    Object.freeze(initial.history);
    const first = submitGuess(initial, '0456', 500).state;
    Object.freeze(first.history[0]);
    Object.freeze(first.history);
    Object.freeze(first);
    const second = submitGuess(first, '0231', 700).state;
    expect(initial.history).toEqual([]);
    expect(first.history).toEqual([{ guess: '0456', bulls: 1, cows: 0 }]);
    expect(second.history).toEqual([
      ...first.history,
      { guess: '0231', bulls: 1, cows: 3 },
    ]);
    expect(second.history).not.toBe(first.history);
    expect(second.history[0]).toBe(first.history[0]);
  });

  it('rejects invalid attempts without incrementing the count', () => {
    const state = createGame({ length: 4, base: 10 }, '0123', 0);
    expect(submitGuess(state, '0012', 100)).toEqual({ state, error: 'invalid' });
    expect(submitGuess(state, '0012', 100).state).toBe(state);
  });

  it('recognizes duplicate guesses regardless of case', () => {
    const initial = createGame({ length: 4, base: 16 }, 'abcd', 0);
    const state = submitGuess(initial, 'AB01', 100).state;
    expect(submitGuess(state, 'ab01', 200)).toEqual({ state, error: 'duplicate' });
    expect(state.history).toHaveLength(1);
  });

  it('wins with uppercase input and stops accepting attempts', () => {
    const initial = createGame({ length: 4, base: 16 }, 'ab09', 100);
    const won = submitGuess(initial, 'AB09', 1500).state;
    expect(won.status).toBe('won');
    expect(won.history).toHaveLength(1);
    expect(won.finishedAt! - won.startedAt).toBe(1400);
    expect(submitGuess(won, 'ab09', 1600)).toEqual({ state: won, error: 'finished' });
  });

  it('allows an unlimited sequence of distinct attempts', () => {
    const initial = createGame({ length: 2, base: 16 }, 'fe', 0);
    const guesses = [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '0a',
      '0b',
      '0c',
    ];
    const state = guesses.reduce(
      (game, guess, index) => submitGuess(game, guess, index).state,
      initial,
    );
    expect(state.history).toHaveLength(12);
    expect(state.status).toBe('playing');
  });

  it('rejects invalid settings, secrets and timestamps', () => {
    expect(() => createGame({ length: 3, base: 2 }, '010', 0)).toThrow(RangeError);
    expect(() => createGame({ length: 4, base: 10 }, '1123', 0)).toThrow(RangeError);
    expect(() => createGame({ length: 4, base: 10 }, '0123', NaN)).toThrow(RangeError);
    const state = createGame({ length: 4, base: 10 }, '0123', 100);
    expect(() => submitGuess(state, '0123', 50)).toThrow(RangeError);
  });
});

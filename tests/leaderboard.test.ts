import { describe, expect, it, vi } from 'vitest';
import { parseScores, rankScores } from '../src/core/leaderboard.js';
import { loadScores, saveScores } from '../src/services/storage.js';

const score = (attempts = 3, durationMs = 1000) => ({
  length: 4,
  base: 10,
  attempts,
  durationMs,
});

describe('leaderboard', () => {
  it('sorts by attempts first and then elapsed time, without changing its input', () => {
    const input = Object.freeze([
      Object.freeze(score(4, 100)),
      Object.freeze(score(2, 2000)),
      Object.freeze(score(2, 500)),
    ]);
    expect(rankScores(input)).toEqual([score(2, 500), score(2, 2000), score(4, 100)]);
    expect(input[0]).toEqual(score(4, 100));
    expect(rankScores(input)).not.toBe(input);
  });

  it('keeps the best ten records and retains round settings', () => {
    const input = Array.from({ length: 12 }, (_, i) => score(i + 1));
    const binary = { length: 2, base: 2, attempts: 1, durationMs: 0 };
    expect(rankScores([...input, binary])).toHaveLength(10);
    expect(rankScores([...input, binary])[0]).toEqual(binary);
  });

  it('supports a smaller top-N list', () => {
    expect(rankScores([score(4), score(1), score(3)], 2)).toEqual([score(1), score(3)]);
  });

  it.each([null, '', '{', '{}', 'null', '42'])(
    'handles invalid stored data %s',
    (raw) => {
      expect(parseScores(raw)).toEqual([]);
    },
  );

  it('filters invalid entries and removes unknown properties', () => {
    const invalid = [
      null,
      {},
      { ...score(), length: 3, base: 2 },
      { ...score(), attempts: -1 },
      { ...score(), attempts: 1.5 },
      { ...score(), durationMs: -1 },
      { ...score(), attempts: '3' },
      { ...score(), durationMs: null },
    ];
    expect(
      parseScores(JSON.stringify([...invalid, { ...score(), extra: 'ignore' }])),
    ).toEqual([score()]);
  });
});

describe('storage boundary', () => {
  it('round-trips records through an injected store', () => {
    let stored: string | null = null;
    expect(
      saveScores([score()], (value) => {
        stored = value;
      }),
    ).toBe(true);
    expect(loadScores(() => stored)).toEqual([score()]);
  });

  it('does not crash if browser storage is unavailable or full', () => {
    const denied = vi.fn(() => {
      throw new Error('Storage denied');
    });
    expect(loadScores(denied)).toEqual([]);
    expect(saveScores([score()], denied)).toBe(false);
  });
});

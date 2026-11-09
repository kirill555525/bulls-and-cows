import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../src/core/count.js';

describe('countPossibleSecrets', () => {
  it.each([
    [0, 0, 1],
    [0, 10, 1],
    [2, 2, 2],
    [2, 8, 56],
    [4, 10, 5040],
    [4, 16, 43680],
    [6, 16, 5765760],
    [16, 16, 20922789888000],
  ])('P(%s digits, base %s) = %s', (length, base, expected) => {
    expect(countPossibleSecrets(length, base)).toBe(expected);
  });

  it('keeps cached results separate for both arguments', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(4, 16)).toBe(43680);
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it.each([
    [-1, 10],
    [3, 2],
    [2.5, 10],
    [2, 17],
    [0, -1],
    [2, NaN],
  ])('rejects length %s and base %s', (length, base) => {
    expect(() => countPossibleSecrets(length, base)).toThrow(RangeError);
  });
});

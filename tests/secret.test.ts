import { describe, expect, it, vi } from 'vitest';
import { generateSecret } from '../src/core/secret.js';
import { isValidGuess } from '../src/core/validation.js';

describe('generateSecret', () => {
  it('preserves the leading zero and terminates with a constant source', () => {
    const random = vi.fn(() => 0);
    expect(generateSecret(4, 10, random)).toBe('0123');
    expect(random).toHaveBeenCalledTimes(4);
  });

  it('can choose the last digit at every step', () => {
    expect(generateSecret(4, 16, () => 0.999)).toBe('fedc');
  });

  it.each([2, 8, 10, 16])('generates a valid secret for base %s', (base) => {
    const length = Math.min(6, base);
    expect(
      isValidGuess(
        generateSecret(length, base, () => 0.5),
        length,
        base,
      ),
    ).toBe(true);
  });

  it('can use every digit without duplication', () => {
    expect(generateSecret(16, 16, () => 0)).toBe('0123456789abcdef');
  });

  it.each([
    [0, 10],
    [3, 2],
    [2.5, 10],
    [2, 1],
    [2, 17],
    [2, 2.5],
    [NaN, 10],
  ])('rejects length %s and base %s', (length, base) => {
    expect(() => generateSecret(length, base, () => 0)).toThrow(RangeError);
  });

  it.each([-0.1, 1, NaN, Infinity])('rejects random result %s', (value) => {
    expect(() => generateSecret(4, 10, () => value)).toThrow(RangeError);
  });
});

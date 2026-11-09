import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../src/core/validation.js';

describe('isValidGuess', () => {
  it.each([
    ['01', 2, 2],
    ['0123', 4, 10],
    ['7650', 4, 8],
    ['aB09', 4, 16],
    ['012345', 6, 10],
  ])('accepts %s with length %s and base %s', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(true);
  });

  it.each([
    ['', 4, 10],
    ['123', 4, 10],
    ['01234', 4, 10],
    ['0012', 4, 10],
    ['aA09', 4, 16],
    ['0182', 4, 8],
    ['0123', 4, 2],
    ['12 3', 4, 10],
    ['-123', 4, 10],
    ['1234', 4.5, 10],
    ['', 0, 10],
    ['01', 2, 17],
  ])('rejects %s with length %s and base %s', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(false);
  });
});

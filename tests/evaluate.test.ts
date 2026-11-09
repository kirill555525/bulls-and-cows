import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../src/core/evaluate.js';

describe('evaluateGuess', () => {
  it.each([
    ['1234', '1234', 4, 0],
    ['1234', '4321', 0, 4],
    ['1234', '5678', 0, 0],
    ['1234', '1325', 1, 2],
    ['0123', '0456', 1, 0],
    ['aB09', 'Ab09', 4, 0],
    ['abcd', 'DCBA', 0, 4],
    ['01', '10', 0, 2],
  ])('%s against %s gives %s bulls and %s cows', (secret, guess, bulls, cows) => {
    expect(evaluateGuess(secret, guess)).toEqual({ bulls, cows });
  });

  it('returns a new result without retaining earlier calls', () => {
    const first = evaluateGuess('0123', '0123');
    expect(evaluateGuess('0123', '4567')).toEqual({ bulls: 0, cows: 0 });
    expect(first).toEqual({ bulls: 4, cows: 0 });
  });
});

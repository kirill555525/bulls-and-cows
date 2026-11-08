import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../src/core/digits.js';

describe('createDigitValidator', () => {
  it.each([
    [2, '0'],
    [2, '1'],
    [8, '7'],
    [10, '9'],
    [16, 'a'],
    [16, 'F'],
  ])('accepts %s-base digit %s', (base, char) => {
    expect(createDigitValidator(base)(char)).toBe(true);
  });

  it.each([
    [2, '2'],
    [8, '8'],
    [10, 'a'],
    [16, 'g'],
    [16, ''],
    [16, 'ab'],
    [16, ' '],
    [16, '-'],
    [16, 'А'],
  ])('rejects %s-base character %s', (base, char) => {
    expect(createDigitValidator(base)(char)).toBe(false);
  });

  it.each([0, 1, 17, 2.5, NaN])('rejects invalid base %s', (base) => {
    expect(createDigitValidator(base)('0')).toBe(false);
  });

  it('keeps predicates independent', () => {
    const binary = createDigitValidator(2);
    const hex = createDigitValidator(16);
    expect(hex('a')).toBe(true);
    expect(binary('a')).toBe(false);
    expect(binary('1')).toBe(true);
  });
});

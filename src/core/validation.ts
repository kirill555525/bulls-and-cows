import { createDigitValidator } from './digits.js';

export function isValidGuess(guess: string, length: number, base: number): boolean {
  const digits = [...guess.toLowerCase()];
  return (
    Number.isInteger(length) &&
    length >= 1 &&
    length <= base &&
    digits.length === length &&
    digits.every(createDigitValidator(base)) &&
    new Set(digits).size === length
  );
}

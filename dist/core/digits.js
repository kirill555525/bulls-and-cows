export const DIGITS = '0123456789abcdef';
export function createDigitValidator(base) {
    const validBase = Number.isInteger(base) && base >= 2 && base <= DIGITS.length;
    const alphabet = validBase ? DIGITS.slice(0, base) : '';
    return (char) => char.length === 1 && alphabet.includes(char.toLowerCase());
}

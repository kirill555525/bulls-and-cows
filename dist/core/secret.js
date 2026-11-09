import { DIGITS } from './digits.js';
export function generateSecret(length, base, random = Math.random) {
    if (!Number.isInteger(base) ||
        base < 2 ||
        base > DIGITS.length ||
        !Number.isInteger(length) ||
        length < 1 ||
        length > base) {
        throw new RangeError('Invalid length or base');
    }
    const pick = (available, remaining) => {
        if (remaining === 0)
            return '';
        const value = random();
        if (!Number.isFinite(value) || value < 0 || value >= 1) {
            throw new RangeError('Random source must return a value in [0, 1)');
        }
        const index = Math.floor(value * available.length);
        return (available[index] +
            pick(available.filter((_, i) => i !== index), remaining - 1));
    };
    return pick([...DIGITS.slice(0, base)], length);
}

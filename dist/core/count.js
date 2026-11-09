const cache = new Map();
export function countPossibleSecrets(length, base) {
    if (!Number.isInteger(base) ||
        base < 0 ||
        base > 16 ||
        !Number.isInteger(length) ||
        length < 0 ||
        length > base) {
        throw new RangeError('Invalid length or base');
    }
    const key = `${base}:${length}`;
    const cached = cache.get(key);
    if (cached !== undefined)
        return cached;
    const result = length === 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1);
    cache.set(key, result);
    return result;
}

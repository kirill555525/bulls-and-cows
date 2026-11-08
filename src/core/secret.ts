export function generateSecret(
  length: number,
  base: number,
  random = Math.random,
): string {
  void [length, base, random];
  throw new Error('Not implemented');
}

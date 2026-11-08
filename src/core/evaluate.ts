export type Feedback = Readonly<{ bulls: number; cows: number }>;

export function evaluateGuess(secret: string, guess: string): Feedback {
  const normalizedSecret = secret.toLowerCase();
  const secretDigits = new Set(normalizedSecret);
  return [...guess.toLowerCase()].reduce<Feedback>(
    (result, digit, index) => {
      if (digit === normalizedSecret[index]) {
        return { ...result, bulls: result.bulls + 1 };
      }
      return secretDigits.has(digit) ? { ...result, cows: result.cows + 1 } : result;
    },
    { bulls: 0, cows: 0 },
  );
}

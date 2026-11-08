export type Feedback = Readonly<{ bulls: number; cows: number }>;

export function evaluateGuess(secret: string, guess: string): Feedback {
  void [secret, guess];
  throw new Error('Not implemented');
}

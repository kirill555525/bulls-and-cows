import { evaluateGuess } from './evaluate.js';
import { isValidGuess } from './validation.js';
export const BASES = [2, 8, 10, 16];
export const MIN_LENGTH = 2;
export const MAX_LENGTH = 6;
export function isValidSettings(settings) {
    return (BASES.includes(settings.base) &&
        Number.isInteger(settings.length) &&
        settings.length >= MIN_LENGTH &&
        settings.length <= MAX_LENGTH &&
        settings.length <= settings.base);
}
export function createGame(settings, secret, startedAt) {
    if (!isValidSettings(settings) ||
        !isValidGuess(secret, settings.length, settings.base) ||
        !Number.isFinite(startedAt) ||
        startedAt < 0) {
        throw new RangeError('Invalid game configuration');
    }
    return {
        settings: { ...settings },
        secret: secret.toLowerCase(),
        history: [],
        status: 'playing',
        startedAt,
        finishedAt: null,
    };
}
export function submitGuess(state, guess, now) {
    if (state.status !== 'playing')
        return { state, error: 'finished' };
    if (!Number.isFinite(now) || now < state.startedAt) {
        throw new RangeError('Invalid attempt time');
    }
    const normalized = guess.toLowerCase();
    if (!isValidGuess(normalized, state.settings.length, state.settings.base)) {
        return { state, error: 'invalid' };
    }
    if (state.history.some((entry) => entry.guess === normalized)) {
        return { state, error: 'duplicate' };
    }
    const feedback = evaluateGuess(state.secret, normalized);
    const won = feedback.bulls === state.settings.length;
    return {
        state: {
            ...state,
            history: [...state.history, { guess: normalized, ...feedback }],
            status: won ? 'won' : 'playing',
            finishedAt: won ? now : null,
        },
    };
}

import { parseScores } from '../core/leaderboard.js';
export const STORAGE_KEY = 'bulls-and-cows:scores:v1';
export function loadScores(read = () => localStorage.getItem(STORAGE_KEY)) {
    try {
        return parseScores(read());
    }
    catch {
        return [];
    }
}
export function saveScores(scores, write = (value) => localStorage.setItem(STORAGE_KEY, value)) {
    try {
        write(JSON.stringify(scores));
        return true;
    }
    catch {
        return false;
    }
}

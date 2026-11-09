import type { Score } from '../core/leaderboard.js';
import { BASE_LABELS, element, formatTime } from './dom.js';

export function renderLeaderboard(
  container: HTMLElement,
  scores: readonly Score[],
): void {
  container.replaceChildren();
  if (scores.length === 0) {
    container.append(
      element(
        'p',
        'empty-state',
        'Здесь будет твой первый рекорд. Разгадай код, чтобы начать список.',
      ),
    );
    return;
  }
  const list = element('ol', 'records');
  scores.forEach((score, index) => {
    const row = element('li', 'record');
    const details = element('div', 'record-details');
    details.append(
      element('strong', '', `${score.attempts} попыт. · ${formatTime(score.durationMs)}`),
      element(
        'span',
        'record-mode',
        `${BASE_LABELS[score.base]} / длина ${score.length}`,
      ),
    );
    row.append(
      element('span', 'record-rank', String(index + 1).padStart(2, '0')),
      details,
    );
    list.append(row);
  });
  container.append(list);
}

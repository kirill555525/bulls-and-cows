import { countPossibleSecrets } from '../core/count.js';
import { createDigitValidator, DIGITS } from '../core/digits.js';
import { BASES, createGame, MAX_LENGTH, MIN_LENGTH, submitGuess } from '../core/game.js';
import type { Attempt, GameState, Settings } from '../core/game.js';
import { rankScores } from '../core/leaderboard.js';
import { generateSecret } from '../core/secret.js';
import { loadScores, saveScores } from '../services/storage.js';
import { BASE_LABELS, element, field, formatTime } from './dom.js';
import { renderLeaderboard } from './leaderboard-view.js';

export function mountGame(root: HTMLElement): void {
  let game: GameState | null = null;
  let scores = loadScores();
  let timerId: number | undefined;

  const shell = element('main', 'shell');
  const masthead = element('div', 'masthead');
  masthead.append(
    element('span', 'wordmark', 'BULLS & COWS'),
    element('span', 'edition', 'ИГРА НА ЛОГИКУ / 01'),
  );
  const hero = element('header', 'hero');
  const heading = element('h1', '', 'Раскрой ');
  heading.append(element('span', '', 'секретный код.'));
  const intro = element('div', 'hero-copy');
  intro.append(
    element('p', 'eyebrow', 'ДУМАЙ. ПРОВЕРЯЙ. УГАДЫВАЙ.'),
    heading,
    element(
      'p',
      'lead',
      'Уникальные цифры. Точные подсказки. Сколько попыток понадобится тебе?',
    ),
  );
  const emblem = element('div', 'emblem');
  emblem.setAttribute('aria-hidden', 'true');
  emblem.append(
    element('span', 'emblem-code', '0 1'),
    element('span', 'emblem-caption', 'CRACK THE CODE'),
  );
  hero.append(intro, emblem);

  const layout = element('div', 'layout');
  const playColumn = element('div', 'play-column');
  const sidebar = element('aside', 'sidebar');
  const settingsCard = element('section', 'card settings-card');
  settingsCard.append(
    element('p', 'eyebrow', '01 / НАСТРОЙКА'),
    element('h2', '', 'Выбери свой код'),
  );
  const settingsFields = element('fieldset', 'settings-fields');
  settingsFields.append(element('legend', 'visually-hidden', 'Настройки раунда'));
  const baseSelect = element('select');
  baseSelect.id = 'base';
  BASES.forEach((base) => {
    const option = element('option', '', `${BASE_LABELS[base]} · основание ${base}`);
    option.value = String(base);
    baseSelect.append(option);
  });
  baseSelect.value = '10';
  const lengthSelect = element('select');
  lengthSelect.id = 'length';
  Array.from({ length: MAX_LENGTH - MIN_LENGTH + 1 }, (_, i) => i + MIN_LENGTH).forEach(
    (length) => {
      const option = element('option', '', String(length));
      option.value = String(length);
      lengthSelect.append(option);
    },
  );
  lengthSelect.value = '4';
  settingsFields.append(
    field('Система счисления', baseSelect),
    field('Длина кода', lengthSelect),
  );
  const possibilities = element('p', 'possibilities');
  const startButton = element('button', 'button primary', 'Начать игру →');
  startButton.type = 'button';
  const newButton = element('button', 'button secondary', 'Новая игра');
  newButton.type = 'button';
  newButton.hidden = true;
  settingsCard.append(settingsFields, possibilities, startButton, newButton);

  const gameCard = element('section', 'card game-card');
  const gameHeading = element('div', 'section-heading');
  const status = element('span', 'status-badge', 'ОЖИДАНИЕ');
  gameHeading.append(element('p', 'eyebrow', '02 / ТВОЯ ПОПЫТКА'), status);
  const codePreview = element('div', 'code-preview');
  codePreview.setAttribute('aria-label', 'Секретный код');
  const stats = element('div', 'stats');
  const attemptCount = element('span', '', 'Попытки: 0');
  const clock = element('span', '', 'Время: 00:00.0');
  stats.append(attemptCount, clock);
  const guessForm = element('form', 'guess-form');
  const input = element('input', 'guess-input');
  input.id = 'guess';
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('aria-describedby', 'input-hint feedback');
  input.disabled = true;
  const submitButton = element('button', 'button primary', 'Проверить →');
  submitButton.type = 'submit';
  submitButton.disabled = true;
  guessForm.append(field('Введи свой вариант', input), submitButton);
  const hint = element('p', 'hint');
  hint.id = 'input-hint';
  const feedback = element('p', 'feedback', 'Настрой раунд и нажми «Начать игру».');
  feedback.id = 'feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  const history = element('ol', 'history');
  history.setAttribute('aria-label', 'История попыток');
  const emptyHistory = element('p', 'empty-state', 'Каждая попытка приближает к ответу.');
  gameCard.append(
    gameHeading,
    element('h2', '', 'Собери подсказки'),
    codePreview,
    stats,
    guessForm,
    hint,
    feedback,
    element('h3', 'history-title', 'История попыток'),
    emptyHistory,
    history,
  );

  const rules = element('section', 'card rules-card');
  rules.append(
    element('p', 'eyebrow', 'КАК ЭТО РАБОТАЕТ'),
    element('h2', '', 'Две подсказки'),
  );
  const bull = element('div', 'rule');
  bull.append(
    element('span', 'rule-marker bull', 'B'),
    element('p', '', 'Бык — цифра угадана и стоит на своём месте.'),
  );
  const cow = element('div', 'rule');
  cow.append(
    element('span', 'rule-marker cow', 'C'),
    element('p', '', 'Корова — цифра есть в коде, но стоит в другом месте.'),
  );
  rules.append(
    bull,
    cow,
    element(
      'p',
      'rule-note',
      'Цифры не повторяются. Код может начинаться с 0. Попытки не ограничены.',
    ),
  );
  const recordCard = element('section', 'card record-card');
  const recordList = element('div');
  recordList.id = 'leaderboard';
  recordCard.append(
    element('p', 'eyebrow', 'ЛИЧНЫЙ ТОП-10'),
    element('h2', '', 'Лучшие разгадки'),
    element(
      'p',
      'hint',
      'Сначала меньше попыток, затем быстрее время. Рекорды этого браузера.',
    ),
    recordList,
  );
  renderLeaderboard(recordList, scores);
  playColumn.append(settingsCard, gameCard);
  sidebar.append(rules, recordCard);
  layout.append(playColumn, sidebar);
  shell.append(
    masthead,
    hero,
    layout,
    element('footer', '', 'Без спешки. Следующая подсказка уже близко.'),
  );
  root.append(shell);

  function readSettings(): Settings {
    return { length: Number(lengthSelect.value), base: Number(baseSelect.value) };
  }

  function showCode(secret?: string): void {
    const digits = secret
      ? [...secret.toUpperCase()]
      : Array<string>(readSettings().length).fill('·');
    codePreview.replaceChildren(
      ...digits.map((digit) => element('span', 'code-digit', digit)),
    );
  }

  function updateSettings(): void {
    const base = Number(baseSelect.value);
    Array.from(lengthSelect.options).forEach((option) => {
      option.disabled = Number(option.value) > base;
    });
    if (Number(lengthSelect.value) > base) lengthSelect.value = String(base);
    const { length } = readSettings();
    possibilities.textContent = `${countPossibleSecrets(length, base).toLocaleString('ru-RU')} возможных кодов`;
    hint.textContent = `Длина: ${length}. Допустимые символы: ${DIGITS.slice(0, base)}. Без повторений.`;
    input.inputMode = base === 16 ? 'text' : 'numeric';
    input.placeholder = '·'.repeat(length);
    showCode();
  }

  function stopTimer(): void {
    window.clearInterval(timerId);
    timerId = undefined;
  }

  function updateClock(): void {
    const elapsed = game ? (game.finishedAt ?? performance.now()) - game.startedAt : 0;
    clock.textContent = `Время: ${formatTime(elapsed)}`;
  }

  function appendAttempt(attempt: Attempt): void {
    emptyHistory.hidden = true;
    const row = element('li', 'attempt');
    row.append(
      element('span', 'attempt-number', String(game?.history.length).padStart(2, '0')),
      element('strong', 'attempt-guess', attempt.guess.toUpperCase()),
      element('span', 'result-bulls', `Быки: ${attempt.bulls}`),
      element('span', 'result-cows', `Коровы: ${attempt.cows}`),
    );
    history.append(row);
  }

  function finishRound(won: GameState): void {
    stopTimer();
    input.disabled = true;
    submitButton.disabled = true;
    status.textContent = 'КОД РАСКРЫТ';
    status.classList.add('won');
    showCode(won.secret);
    scores = rankScores([
      ...scores,
      {
        ...won.settings,
        attempts: won.history.length,
        durationMs: (won.finishedAt ?? won.startedAt) - won.startedAt,
      },
    ]);
    const saved = saveScores(scores);
    renderLeaderboard(recordList, scores);
    feedback.textContent = `Победа! Код ${won.secret.toUpperCase()} разгадан. Попыток: ${won.history.length}. Время: ${formatTime((won.finishedAt ?? won.startedAt) - won.startedAt)}.${saved ? '' : ' Браузер не разрешил сохранить рекорд.'}`;
    feedback.className = 'feedback success';
    newButton.focus();
  }

  baseSelect.addEventListener('change', updateSettings);
  lengthSelect.addEventListener('change', updateSettings);
  startButton.addEventListener('click', () => {
    const settings = readSettings();
    game = createGame(
      settings,
      generateSecret(settings.length, settings.base),
      performance.now(),
    );
    settingsFields.disabled = true;
    startButton.hidden = true;
    newButton.hidden = false;
    input.disabled = false;
    submitButton.disabled = false;
    status.textContent = 'РАУНД ИДЁТ';
    feedback.textContent = 'Код загадан. Введи первую попытку.';
    stopTimer();
    updateClock();
    timerId = window.setInterval(updateClock, 100);
    input.focus();
  });

  input.addEventListener('input', () => {
    const settings = game?.settings ?? readSettings();
    const validDigit = createDigitValidator(settings.base);
    const position = input.selectionStart ?? input.value.length;
    const caret = [...input.value.slice(0, position)].filter(validDigit).length;
    input.value = [...input.value.toLowerCase()]
      .filter(validDigit)
      .slice(0, settings.length)
      .join('');
    input.setSelectionRange(
      Math.min(caret, input.value.length),
      Math.min(caret, input.value.length),
    );
    input.removeAttribute('aria-invalid');
  });

  guessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!game || game.status !== 'playing') return;
    const result = submitGuess(game, input.value, performance.now());
    if (result.error) {
      feedback.textContent =
        result.error === 'duplicate'
          ? 'Этот вариант уже был. Попробуй другой.'
          : 'Проверь длину кода: нужны уникальные допустимые цифры.';
      feedback.className = 'feedback error';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    game = result.state;
    const attempt = game.history[game.history.length - 1];
    appendAttempt(attempt);
    attemptCount.textContent = `Попытки: ${game.history.length}`;
    input.value = '';
    input.removeAttribute('aria-invalid');
    feedback.className = 'feedback';
    feedback.textContent = `Быки: ${attempt.bulls}. Коровы: ${attempt.cows}. Попробуй следующий вариант.`;
    updateClock();
    if (game.status === 'won') finishRound(game);
    else input.focus();
  });

  newButton.addEventListener('click', () => {
    stopTimer();
    game = null;
    settingsFields.disabled = false;
    startButton.hidden = false;
    newButton.hidden = true;
    input.disabled = true;
    submitButton.disabled = true;
    input.value = '';
    input.removeAttribute('aria-invalid');
    history.replaceChildren();
    emptyHistory.hidden = false;
    attemptCount.textContent = 'Попытки: 0';
    status.textContent = 'ОЖИДАНИЕ';
    status.classList.remove('won');
    feedback.textContent = 'Выбери настройки нового раунда.';
    feedback.className = 'feedback';
    updateClock();
    updateSettings();
    baseSelect.focus();
  });

  updateSettings();
}

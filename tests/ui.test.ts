// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountGame } from '../src/ui/app.js';
import { STORAGE_KEY } from '../src/services/storage.js';

function button(text: string): HTMLButtonElement {
  const found = Array.from(document.querySelectorAll('button')).find(
    (node) => node.textContent === text,
  );
  if (!found) throw new Error(`Button not found: ${text}`);
  return found;
}

function select(id: string, value: string): void {
  const control = document.getElementById(id) as HTMLSelectElement;
  control.value = value;
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function inputGuess(value: string): HTMLInputElement {
  const input = document.getElementById('guess') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

function submit(value: string): void {
  inputGuess(value);
  button('Проверить →').click();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  localStorage.clear();
  document.body.replaceChildren();
  mountGame(document.body);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('game interface', () => {
  it('limits binary settings and restores other lengths when changing base', () => {
    select('base', '2');
    const length = document.getElementById('length') as HTMLSelectElement;
    expect(length.value).toBe('2');
    expect(
      Array.from(length.options)
        .filter((option) => !option.disabled)
        .map((option) => option.value),
    ).toEqual(['2']);
    select('base', '16');
    expect(Array.from(length.options).every((option) => !option.disabled)).toBe(true);
  });

  it('locks settings during a round and filters invalid pasted characters', () => {
    button('Начать игру →').click();
    expect(document.getElementById('base')?.matches(':disabled')).toBe(true);
    expect(document.getElementById('length')?.matches(':disabled')).toBe(true);
    expect(inputGuess('a0!1 23z4').value).toBe('0123');
    expect(button('Проверить →').disabled).toBe(false);
  });

  it('rejects wrong length, repeated digits and repeated guesses', () => {
    button('Начать игру →').click();
    submit('00');
    expect(document.querySelectorAll('.history li')).toHaveLength(0);
    submit('0012');
    expect(document.querySelectorAll('.history li')).toHaveLength(0);
    submit('0456');
    const firstRow = document.querySelector('.history li');
    expect(firstRow?.textContent).toContain('Быки: 1');
    submit('0456');
    expect(document.querySelectorAll('.history li')).toHaveLength(1);
    expect(document.getElementById('feedback')?.textContent).toContain('уже был');
    submit('0231');
    expect(document.querySelectorAll('.history li')).toHaveLength(2);
    expect(document.querySelector('.history li')).toBe(firstRow);
  });

  it('accepts uppercase hex, finishes the round and records the elapsed time', () => {
    vi.mocked(Math.random).mockReturnValue(0.999);
    select('base', '16');
    button('Начать игру →').click();
    vi.advanceTimersByTime(2400);
    submit('FEDC');
    expect(document.getElementById('feedback')?.textContent).toContain('Победа!');
    expect((document.getElementById('guess') as HTMLInputElement).disabled).toBe(true);
    expect(button('Проверить →').disabled).toBe(true);
    expect(document.getElementById('base')?.matches(':disabled')).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      { length: 4, base: 16, attempts: 1, durationMs: 2400 },
    ]);
    expect(document.querySelector('.code-preview')?.textContent).toBe('FEDC');
    expect(document.getElementById('leaderboard')?.textContent).toContain(
      'HEX / длина 4',
    );
    const clock = document.querySelector('.stats')?.textContent;
    vi.advanceTimersByTime(5000);
    expect(document.querySelector('.stats')?.textContent).toBe(clock);
  });

  it('starts another game without reloading and retains saved records on remount', () => {
    button('Начать игру →').click();
    submit('0123');
    const shell = document.querySelector('main');
    button('Новая игра').click();
    expect(document.querySelector('main')).toBe(shell);
    expect(document.querySelectorAll('.history li')).toHaveLength(0);
    expect(document.getElementById('base')?.matches(':disabled')).toBe(false);
    expect(button('Начать игру →').hidden).toBe(false);
    expect(document.querySelectorAll('.record')).toHaveLength(1);
    document.body.replaceChildren();
    mountGame(document.body);
    expect(document.querySelectorAll('.record')).toHaveLength(1);
    expect(document.getElementById('leaderboard')?.textContent).toContain(
      'DEC / длина 4',
    );
  });

  it('can reset an unfinished round and stop its timer', () => {
    button('Начать игру →').click();
    vi.advanceTimersByTime(1500);
    button('Новая игра').click();
    vi.advanceTimersByTime(3000);
    expect(document.querySelector('.stats')?.textContent).toContain('00:00.0');
    expect(document.querySelectorAll('.record')).toHaveLength(0);
    select('base', '2');
    button('Начать игру →').click();
    submit('01');
    expect(document.getElementById('feedback')?.textContent).toContain('Победа!');
  });

  it('keeps a won round usable when saving is denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    button('Начать игру →').click();
    submit('0123');
    expect(document.getElementById('feedback')?.textContent).toContain(
      'не разрешил сохранить',
    );
    expect(document.querySelectorAll('.record')).toHaveLength(1);
    expect(button('Новая игра').hidden).toBe(false);
  });
});

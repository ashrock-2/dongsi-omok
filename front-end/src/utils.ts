import { type BoardItem } from '@dongsi-omok/shared';

export const find_item_in_board = (row: string, col: string) =>
  document.querySelector(`[data-row="${row}"][data-col="${col}"]`)!;

export const place_a_item = (button: Element, item: BoardItem) => {
  button.className = 'item';
  button.classList.add(item);
  button.setAttribute('disabled', 'true');
};

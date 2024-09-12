import { type BoardItem, type Player } from '@dongsi-omok/shared';

export const find_item_in_board = (row: string, col: string) =>
  document.querySelector(`[data-row="${row}"][data-col="${col}"]`)!;

export const place_a_item = (
  button: Element,
  item: BoardItem,
  player: Player,
) => {
  button.className = 'item';
  button.classList.add(item);
  button.classList.add(player);
  button.setAttribute('disabled', 'true');
};

import { type Board, type BoardItem } from '@dongsi-omok/shared';

export const check_is_win = (board: Board, row: number, col: number) => {
  const item = board[row][col];
  if (item === null || item === 'prohibit') {
    return false;
  }
  /** row 오목 체크 */
  if (
    board[row - 4]?.[col] === item &&
    board[row - 3]?.[col] === item &&
    board[row - 2]?.[col] === item &&
    board[row - 1]?.[col] === item &&
    board[row]?.[col] === item
  ) {
    return true;
  }
  if (
    board[row - 3]?.[col] === item &&
    board[row - 2]?.[col] === item &&
    board[row - 1]?.[col] === item &&
    board[row]?.[col] === item &&
    board[row + 1]?.[col] === item
  ) {
    return true;
  }
  if (
    board[row - 2]?.[col] === item &&
    board[row - 1]?.[col] === item &&
    board[row]?.[col] === item &&
    board[row + 1]?.[col] === item &&
    board[row + 2]?.[col] === item
  ) {
    return true;
  }
  if (
    board[row - 1]?.[col] === item &&
    board[row]?.[col] === item &&
    board[row + 1]?.[col] === item &&
    board[row + 2]?.[col] === item &&
    board[row + 3]?.[col] === item
  ) {
    return true;
  }
  if (
    board[row]?.[col] === item &&
    board[row + 1]?.[col] === item &&
    board[row + 2]?.[col] === item &&
    board[row + 3]?.[col] === item &&
    board[row + 4]?.[col] === item
  ) {
    return true;
  }
  /** col 오목 체크 */
  if (
    board[row][col - 4] === item &&
    board[row][col - 3] === item &&
    board[row][col - 2] === item &&
    board[row][col - 1] === item &&
    board[row][col] === item
  ) {
    return true;
  }
  if (
    board[row][col - 3] === item &&
    board[row][col - 2] === item &&
    board[row][col - 1] === item &&
    board[row][col] === item &&
    board[row][col + 1] === item
  ) {
    return true;
  }
  if (
    board[row][col - 2] === item &&
    board[row][col - 1] === item &&
    board[row][col] === item &&
    board[row][col + 1] === item &&
    board[row][col + 2] === item
  ) {
    return true;
  }
  if (
    board[row][col - 1] === item &&
    board[row][col] === item &&
    board[row][col + 1] === item &&
    board[row][col + 2] === item &&
    board[row][col + 3] === item
  ) {
    return true;
  }
  if (
    board[row][col] === item &&
    board[row][col + 1] === item &&
    board[row][col + 2] === item &&
    board[row][col + 3] === item &&
    board[row][col + 4] === item
  ) {
    return true;
  }
  /** 좌상단 -> 우하단 오목 */
  if (
    board[row - 4]?.[col - 4] === item &&
    board[row - 3]?.[col - 3] === item &&
    board[row - 2]?.[col - 2] === item &&
    board[row - 1]?.[col - 1] === item &&
    board[row][col] === item
  ) {
    return true;
  }
  if (
    board[row - 3]?.[col - 3] === item &&
    board[row - 2]?.[col - 2] === item &&
    board[row - 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row + 1]?.[col + 1] === item
  ) {
    return true;
  }
  if (
    board[row - 2]?.[col - 2] === item &&
    board[row - 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row + 1]?.[col + 1] === item &&
    board[row + 2]?.[col + 2] === item
  ) {
    return true;
  }
  if (
    board[row - 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row + 1]?.[col + 1] === item &&
    board[row + 2]?.[col + 2] === item &&
    board[row + 3]?.[col + 3] === item
  ) {
    return true;
  }
  if (
    board[row][col] === item &&
    board[row + 1]?.[col + 1] === item &&
    board[row + 2]?.[col + 2] === item &&
    board[row + 3]?.[col + 3] === item &&
    board[row + 4]?.[col + 4] === item
  ) {
    return true;
  }
  /** 좌하단 -> 우상단 오목 */
  if (
    board[row + 4]?.[col - 4] === item &&
    board[row + 3]?.[col - 3] === item &&
    board[row + 2]?.[col - 2] === item &&
    board[row + 1]?.[col - 1] === item &&
    board[row][col] === item
  ) {
    return true;
  }
  if (
    board[row + 3]?.[col - 3] === item &&
    board[row + 2]?.[col - 2] === item &&
    board[row + 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row - 1]?.[col + 1] === item
  ) {
    return true;
  }
  if (
    board[row + 2]?.[col - 2] === item &&
    board[row + 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row - 1]?.[col + 1] === item &&
    board[row - 2]?.[col + 2] === item
  ) {
    return true;
  }
  if (
    board[row + 1]?.[col - 1] === item &&
    board[row][col] === item &&
    board[row - 1]?.[col + 1] === item &&
    board[row - 2]?.[col + 2] === item &&
    board[row - 3]?.[col + 3] === item
  ) {
    return true;
  }
  if (
    board[row][col] === item &&
    board[row - 1]?.[col + 1] === item &&
    board[row - 2]?.[col + 2] === item &&
    board[row - 3]?.[col + 3] === item &&
    board[row - 4]?.[col + 4] === item
  ) {
    return true;
  }
};

export const find_item_in_board = (row: string, col: string) =>
  document.querySelector(`[data-row="${row}"][data-col="${col}"]`)!;

export const place_a_item = (button: Element, item: BoardItem) => {
  button.className = 'item';
  button.classList.add(item);
  button.setAttribute('disabled', 'true');
};

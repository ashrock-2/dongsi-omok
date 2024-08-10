import type { BOARD_TYPE } from "./constants";

export const check_is_win = (board: BOARD_TYPE, row: number, col: number) => {
  const item = board[row][col];
  if (item === null || item === "prohibit") {
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

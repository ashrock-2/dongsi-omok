import {
  ALPHABETS,
  makeServerCommand,
  type BoardItem,
  type Board,
  type ClientCommandType,
  type ServerCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';

export type PlaceCommandQueue = Array<ClientCommandType<'PLACE_ITEM'>>;

export const getCommandQueueState = (placeCommandQueue: PlaceCommandQueue) =>
  match(placeCommandQueue)
    .returnType<'EMPTY' | 'BLACK' | 'WHITE' | 'FULL'>()
    .when(
      (queue) => queue.length === 0,
      () => 'EMPTY',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].player === 'white',
      () => 'WHITE',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].player === 'black',
      () => 'BLACK',
    )
    .when(
      (queue) => queue.length === 2,
      () => 'FULL',
    )
    .otherwise(() => 'FULL');

export const mergePlaceItemCommand = (placeCommandQueue: PlaceCommandQueue) =>
  match(placeCommandQueue)
    .when(
      ([command1, command2]) =>
        command1.payload.row === command2.payload.row &&
        command1.payload.col === command2.payload.col,
      ([command1, command2]) =>
        makeServerCommand('PLACE_ITEM', {
          payload: [
            {
              item: 'prohibit',
              row: command1.payload.row,
              col: command1.payload.col,
            },
          ],
        }),
    )
    .otherwise(([command1, command2]) =>
      makeServerCommand('PLACE_ITEM', {
        payload: [
          {
            item: command1.payload.item,
            row: command1.payload.row,
            col: command1.payload.col,
          },
          {
            item: command2.payload.item,
            row: command2.payload.row,
            col: command2.payload.col,
          },
        ],
      }),
    );

export const updateBoardAndCheckWin = (
  board: Board,
  placeItemCommands: ServerCommandType<'PLACE_ITEM'>,
) =>
  match(placeItemCommands)
    .returnType<{ isFinish: boolean; winner: BoardItem | null }>()
    .when(
      (commands) => commands.payload.length === 1,
      (commands) => {
        const { item, row: _row, col: _col } = commands.payload[0];
        const row = Number(_row);
        const col = ALPHABETS.findIndex((alphabet) => alphabet === _col);

        board[row][col] = item;
        if (checkIsWin(board, row, col)) {
          return { isFinish: true, winner: item };
        }
        return { isFinish: false, winner: null };
      },
    )
    .when(
      (commands) => commands.payload.length === 2,
      ({
        payload: [
          { item: item1, row: _row1, col: _col1 },
          { item: item2, row: _row2, col: _col2 },
        ],
      }) => {
        const row1 = Number(_row1);
        const col1 = ALPHABETS.findIndex((alphabet) => alphabet === _col1);
        const row2 = Number(_row2);
        const col2 = ALPHABETS.findIndex((alphabet) => alphabet === _col2);

        board[row1][col1] = item1;
        board[row2][col2] = item2;
        const isItem1Win = checkIsWin(board, row1, col1);
        const isItem2Win = checkIsWin(board, row2, col2);
        return match({ isItem1Win, isItem2Win })
          .returnType<{ isFinish: boolean; winner: BoardItem | null }>()
          .with({ isItem1Win: true, isItem2Win: false }, () => ({
            isFinish: true,
            winner: item1,
          }))
          .with({ isItem1Win: false, isItem2Win: true }, () => ({
            isFinish: true,
            winner: item2,
          }))
          .with({ isItem1Win: true, isItem2Win: true }, () => ({
            isFinish: true,
            winner: null,
          }))
          .with({ isItem1Win: false, isItem2Win: false }, () => ({
            isFinish: false,
            winner: null,
          }))
          .exhaustive();
      },
    )
    .otherwise(() => ({ isFinish: false, winner: null }));

export const checkIsWin = (board: Board, row: number, col: number) => {
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
  return false;
};

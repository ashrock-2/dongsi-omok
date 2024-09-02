import {
  ALPHABETS,
  makeServerCommand,
  type BoardItem,
  type Board,
  type ClientCommandType,
  type ServerCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';
import type WebSocket from 'ws';

export type PlaceCommandQueue = Array<ClientCommandType<'PLACE_ITEM'>>;
export type Rooms = Map<
  string,
  { clients: Array<WebSocket>; queue: PlaceCommandQueue; board: Board }
>;

export const getCommandQueueState = (queue: PlaceCommandQueue) =>
  match(queue)
    .returnType<'EMPTY' | 'BLACK' | 'WHITE' | 'FULL'>()
    .when(
      (queue) => queue.length === 0,
      () => 'EMPTY',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].payload.item === 'white',
      () => 'WHITE',
    )
    .when(
      (queue) => queue.length === 1 && queue[0].payload.item === 'black',
      () => 'BLACK',
    )
    .when(
      (queue) => queue.length === 2,
      () => 'FULL',
    )
    .otherwise(() => 'FULL');

export const mergePlaceItemCommand = (queue: PlaceCommandQueue) =>
  match(queue)
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
    .when(
      (commands) => commands.payload.length === 1,
      (commands) => {
        const { item, row: _row, col: _col } = commands.payload[0];
        const row = Number(_row);
        const col = ALPHABETS.findIndex((alphabet) => alphabet === _col);

        const { isWin, winningCoordinates } = checkIsWin(board, row, col);
        return {
          isFinish: isWin,
          winner: isWin ? board[row][col] : null,
          winningCoordinates,
        };
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
        const { isWin: isItem1Win, winningCoordinates: winningCoordinates1 } =
          checkIsWin(board, row1, col1);
        const { isWin: isItem2Win, winningCoordinates: winningCoordinates2 } =
          checkIsWin(board, row2, col2);
        return match({ isItem1Win, isItem2Win })
          .with({ isItem1Win: true, isItem2Win: false }, () => ({
            isFinish: true,
            winner: item1,
            winningCoordinates: winningCoordinates1,
          }))
          .with({ isItem1Win: false, isItem2Win: true }, () => ({
            isFinish: true,
            winner: item2,
            winningCoordinates: winningCoordinates2,
          }))
          .with({ isItem1Win: true, isItem2Win: true }, () => ({
            isFinish: true,
            winner: null,
            winningCoordinates: [
              ...winningCoordinates1!,
              ...winningCoordinates2!,
            ],
          }))
          .with({ isItem1Win: false, isItem2Win: false }, () => ({
            isFinish: false,
            winner: null,
            winningCoordinates: null,
          }))
          .exhaustive();
      },
    )
    .otherwise(() => ({
      isFinish: false,
      winner: null,
      winningCoordinates: null,
    }));

export const checkIsWin = (
  board: Board,
  row: number,
  col: number,
): {
  isWin: boolean;
  winningCoordinates: Array<{ row: number; col: number }> | null;
} => {
  const item = board[row][col];
  if (item === null || item === 'prohibit') {
    return { isWin: false, winningCoordinates: null };
  }

  const directions = [
    { dr: 1, dc: 0 }, // Vertical
    { dr: 0, dc: 1 }, // Horizontal
    { dr: 1, dc: 1 }, // Diagonal from top-left to bottom-right
    { dr: 1, dc: -1 }, // Diagonal from bottom-left to top-right
  ];

  const checkDirection = (dr: number, dc: number) => {
    let count = 1;
    const coordinates = [{ row, col }];

    for (let i = 1; i < 5; i++) {
      const newRow = row + i * dr;
      const newCol = col + i * dc;
      if (board[newRow]?.[newCol] === item) {
        count++;
        coordinates.push({ row: newRow, col: newCol });
      } else {
        break;
      }
    }

    for (let i = 1; i < 5; i++) {
      const newRow = row - i * dr;
      const newCol = col - i * dc;
      if (board[newRow]?.[newCol] === item) {
        count++;
        coordinates.push({ row: newRow, col: newCol });
      } else {
        break;
      }
    }

    return count >= 5 ? coordinates : null;
  };

  for (const { dr, dc } of directions) {
    const winningCoordinates = checkDirection(dr, dc);
    if (winningCoordinates) {
      return { isWin: true, winningCoordinates };
    }
  }

  return { isWin: false, winningCoordinates: null };
};

export const generateRoomId = () => Math.random().toString(36).substring(2, 9);

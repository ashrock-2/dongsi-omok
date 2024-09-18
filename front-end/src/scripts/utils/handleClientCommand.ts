import {
  ALPHABETS,
  BOARD_SIZE,
  findColIndex,
  makeClientCommand,
  mergePlaceItemCommand,
  updateBoardAndCheckWin,
  type Board,
  type ClientCommand,
  type ClientCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';

const generateRandomCoordinate = () => {
  const row = Math.floor(Math.random() * BOARD_SIZE).toString();
  const col = ALPHABETS.slice(undefined, BOARD_SIZE)[
    Math.floor(Math.random() * BOARD_SIZE)
  ];
  return { row, col };
};

export const handleClientCommand = (command: ClientCommand, board: Board) => {
  return match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      let { row, col } = generateRandomCoordinate();
      let item = board[Number(row)][findColIndex(col)];
      console.log(board);
      console.log(item);
      while (item !== null) {
        const coordinate = generateRandomCoordinate();
        item = board[Number(row)][findColIndex(col)];
        row = coordinate.row;
        col = coordinate.col;
        console.log(item);
        console.log(row, col);
      }
      const mergedCommand = mergePlaceItemCommand([
        command,
        // makeClientCommand('PLACE_ITEM', {
        // payload: { item: 'white', row, col },
        // }),
      ]);
      const { winner, winningCoordinates, isFinish } = updateBoardAndCheckWin(
        board,
        mergedCommand,
      );
      return mergedCommand;
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      //
    })
    .with({ id: 'JOIN_ROOM' }, () => {
      //
    })
    .with({ id: 'JOIN_QUEUE' }, () => {
      //
    })
    .exhaustive();
};

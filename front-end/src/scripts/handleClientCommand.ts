import {
  makeClientCommand,
  makeServerCommand,
  mergePlaceItemCommand,
  type Board,
  type ClientCommand,
  type ClientCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';

export const handleClientCommand = (command: ClientCommand, board: Board) => {
  return match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      const { row, col } = command.payload;
      const AIRow = String(Number(row) + 1);
      // const AIRow = row;
      const AICol = col;
      return mergePlaceItemCommand([
        command,
        makeClientCommand('PLACE_ITEM', {
          payload: { item: 'white', row: AIRow, col: AICol },
        }),
      ]);
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      //
    })
    .with({ id: 'JOIN_ROOM' }, () => {
      //
    })
    .exhaustive();
};

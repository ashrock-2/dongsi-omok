import { makeServerCommand, type ClientCommandType } from '@dongsi-omok/shared';
import { match, P } from 'ts-pattern';

export type PlaceCommandQueue = Array<ClientCommandType<'PLACE_ITEM'>>;

export const getCommandQueueState = (placeCommandQueue: PlaceCommandQueue) =>
  match(placeCommandQueue)
    .returnType<'EMPTY' | 'BLACK' | 'WHITE' | 'FULL'>()
    .with(
      P.when((queue) => queue.length === 0),
      () => 'EMPTY',
    )
    .with(
      P.when((queue) => queue.length === 1 && queue[0].player === 'white'),
      () => 'WHITE',
    )
    .with(
      P.when((queue) => queue.length === 1 && queue[0].player === 'black'),
      () => 'BLACK',
    )
    .with(
      P.when((queue) => queue.length === 2),
      () => 'FULL',
    )
    .otherwise(() => 'FULL');

export const mergePlaceItemCommand = (placeCommandQueue: PlaceCommandQueue) =>
  match(placeCommandQueue)
    .with(
      P.when(
        ([command1, command2]) =>
          command1.payload.row === command2.payload.row &&
          command1.payload.col === command2.payload.col,
      ),
      ([command1, command2]) => [
        makeServerCommand('PLACE_ITEM', {
          payload: {
            item: 'prohibit',
            row: command1.payload.row,
            col: command1.payload.col,
          },
        }),
      ],
    )
    .otherwise(([command1, command2]) => [
      makeServerCommand('PLACE_ITEM', {
        payload: {
          item: command1.payload.item,
          row: command1.payload.row,
          col: command1.payload.col,
        },
      }),
      makeServerCommand('PLACE_ITEM', {
        payload: {
          item: command2.payload.item,
          row: command2.payload.row,
          col: command2.payload.col,
        },
      }),
    ]);

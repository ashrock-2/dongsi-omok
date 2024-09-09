import {
  makeServerCommand,
  type Board,
  type ClientCommand,
  type ClientCommandType,
  type PlaceCommandQueue,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';

export const handleClientCommand = (
  command: ClientCommand,
  queue: PlaceCommandQueue,
  board: Board,
) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      // match({
      //   queueState: getCommandQueueState(queue),
      //   item: command.payload.item,
      // })
      //   .with(
      //     { queueState: 'EMPTY', item: 'black' },
      //     { queueState: 'EMPTY', item: 'white' },
      //     () => {
      //       queue.push(command);
      //     },
      //   )
      //   .with(
      //     { queueState: 'BLACK', item: 'white' },
      //     { queueState: 'WHITE', item: 'black' },
      //     () => {
      //       queue.push(command);
      //       const placeItemCommand = mergePlaceItemCommand(queue);
      //       const { isFinish, winner, winningCoordinates } =
      //         updateBoardAndCheckWin(board, placeItemCommand);
      //       room.clients.forEach((client) => {
      //         client.send(JSON.stringify(placeItemCommand));
      //         client.send(
      //           JSON.stringify(
      //             makeServerCommand('NOTIFY_WINNER', {
      //               payload: { isFinish, winner, winningCoordinates },
      //             }),
      //           ),
      //         );
      //       });
      //       queue.length = 0;
      //     },
      //   )
      //   .otherwise(() => {
      //     // do nothing
      //   });
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      //
    })
    .with({ id: 'JOIN_ROOM' }, () => {
      //
    })
    .exhaustive();
};

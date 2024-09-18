import {
  initBoard,
  makeServerCommand,
  mergePlaceItemCommand,
  updateBoardAndCheckWin,
  type ClientCommand,
  type ClientCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';
import {
  generateRoomId,
  getCommandQueueState,
  sendServerCommand,
  type ClientMap,
  type GameQueue,
  type Rooms,
} from './util';
import { type Request, type Response } from 'express';

export const handleClientCommand = (
  command: ClientCommand,
  res: Response,
  rooms: Rooms,
  clientMap: ClientMap,
) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      const roomId = clientMap.get(command.playerId);
      if (!roomId) return res.status(400).json({ error: 'Room not found' });
      const room = rooms.get(roomId);
      if (!room) return res.status(400).json({ error: 'Room not found' });
      match({
        queueState: getCommandQueueState(room.queue),
        item: command.payload.item,
      })
        .with(
          { queueState: 'EMPTY', item: 'black' },
          { queueState: 'EMPTY', item: 'white' },
          () => {
            room.queue.push(command);
          },
        )
        .with(
          { queueState: 'BLACK', item: 'white' },
          { queueState: 'WHITE', item: 'black' },
          () => {
            room.queue.push(command);
            const placeItemCommand = mergePlaceItemCommand(room.queue);
            const { isFinish, winner, winningCoordinates } =
              updateBoardAndCheckWin(room.board, placeItemCommand);
            room.clients.forEach(({ clientId, sseResponse }) => {
              sendServerCommand(sseResponse, placeItemCommand);
              sendServerCommand(
                sseResponse,
                makeServerCommand('NOTIFY_WINNER', {
                  payload: { isFinish, winner, winningCoordinates },
                }),
              );
            });
            room.queue.length = 0;
          },
        )
        .otherwise(() => {
          // do nothing
        });
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      //
    })
    .with(
      { id: 'JOIN_ROOM' },
      ({ payload: { roomId } }: ClientCommandType<'JOIN_ROOM'>) => {
        //
      },
    )
    .with({ id: 'JOIN_QUEUE' }, () => {
      //
    })
    .exhaustive();
};

import {
  initBoard,
  makeServerCommand,
  mergePlaceItemCommand,
  updateBoardAndCheckWin,
  type ClientCommand,
  type ClientCommandType,
} from '@dongsi-omok/shared';
import { match } from 'ts-pattern';
import { generateRoomId, getCommandQueueState, type Rooms } from './util';
import type WebSocket from 'ws';
import { Mutex } from 'async-mutex';

export const handleClientCommand = (
  command: ClientCommand,
  ws: WebSocket,
  rooms: Rooms,
  clientMap: Map<WebSocket, string>,
  gameQueue: Array<WebSocket>,
) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      const roomId = clientMap.get(ws);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;
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
            room.clients.forEach((client) => {
              client.send(JSON.stringify(placeItemCommand));
              client.send(
                JSON.stringify(
                  makeServerCommand('NOTIFY_WINNER', {
                    payload: { isFinish, winner, winningCoordinates },
                  }),
                ),
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
      const roomId = generateRoomId();
      rooms.set(roomId, {
        clients: [ws],
        queue: [],
        board: initBoard(),
      });
      clientMap.set(ws, roomId);
      ws.send(
        JSON.stringify(
          makeServerCommand('SEND_ROOM_ID', { payload: { roomId } }),
        ),
      );
    })
    .with(
      { id: 'JOIN_ROOM' },
      ({ payload: { roomId } }: ClientCommandType<'JOIN_ROOM'>) => {
        const room = rooms.get(roomId);
        match(room)
          .when(
            (room) => room === undefined,
            () => {
              ws.send(JSON.stringify('no room with that id'));
              ws.close();
            },
          )
          .when(
            (room) => room.clients.length === 1,
            (room) => {
              clientMap.set(ws, roomId);
              room.clients.push(ws);
              room.clients.forEach((ws, idx) => {
                ws.send(
                  JSON.stringify(
                    makeServerCommand('SET_PLAYER_COLOR', {
                      payload: { color: idx === 0 ? 'black' : 'white' },
                    }),
                  ),
                );
                ws.send(
                  JSON.stringify(
                    makeServerCommand('START_GAME', { payload: {} }),
                  ),
                );
              });
            },
          )
          .when(
            (room) => room.clients.length >= 2,
            () => {
              ws.send(JSON.stringify('You are not allowed.'));
              ws.close();
            },
          )
          .otherwise(() => {
            ws.send(JSON.stringify('You are not allowed.'));
            ws.close();
          });
      },
    )
    .with({ id: 'JOIN_QUEUE' }, () => {
      const mutex = new Mutex();
      mutex.acquire().then((release) => {
        try {
          gameQueue.push(ws);
          if (gameQueue.length === 2) {
            const roomId = generateRoomId();
            rooms.set(roomId, {
              clients: [...gameQueue],
              queue: [],
              board: initBoard(),
            });
            gameQueue.forEach((ws, idx) => {
              clientMap.set(ws, roomId);
              ws.send(
                JSON.stringify(
                  makeServerCommand('SET_PLAYER_COLOR', {
                    payload: { color: idx === 0 ? 'black' : 'white' },
                  }),
                ),
              );
              ws.send(
                JSON.stringify(
                  makeServerCommand('START_GAME', { payload: {} }),
                ),
              );
            });
            gameQueue.splice(0, 2);
          }
        } finally {
          release();
        }
      });
    })
    .exhaustive();
};

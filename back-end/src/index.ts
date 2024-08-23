import {
  type ClientCommandType,
  type ClientCommand,
  isValidClientCommand,
  makeServerCommand,
  type Board,
  BOARD_SIZE,
} from '@dongsi-omok/shared';
import { createServer } from 'http';
import { match } from 'ts-pattern';
import { WebSocketServer, WebSocket } from 'ws';
import {
  findRoomIdByWs,
  generateRoomId,
  getCommandQueueState,
  mergePlaceItemCommand,
  removeWsFromRoom,
  updateBoardAndCheckWin,
  type Rooms,
} from './util';
const server = createServer();
const wss = new WebSocketServer({ server });
const board: Board = Array.from({ length: BOARD_SIZE }, (_) =>
  Array.from({ length: BOARD_SIZE }, (__) => null),
);
const rooms: Rooms = new Map();

const handleClientCommand = (command: ClientCommand, ws: WebSocket) => {
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      const roomId = findRoomIdByWs(ws, rooms);
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
            const { isFinish, winner } = updateBoardAndCheckWin(
              board,
              placeItemCommand,
            );
            room.clients.forEach((client) => {
              client.send(JSON.stringify(placeItemCommand));
              client.send(
                JSON.stringify(
                  makeServerCommand('NOTIFY_WINNER', {
                    payload: { isFinish, winner },
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
      rooms.set(roomId, { clients: [ws], queue: [] });
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
    .exhaustive();
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (isValidClientCommand(parsedMessage)) {
        handleClientCommand(parsedMessage, ws);
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  });

  ws.on('close', () => {
    const roomId = findRoomIdByWs(ws, rooms);
    if (roomId) {
      removeWsFromRoom(roomId, ws, rooms);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});

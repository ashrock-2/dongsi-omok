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
  checkIsWin,
  generateRoomId,
  getCommandQueueState,
  mergePlaceItemCommand,
  updateBoardAndCheckWin,
  type PlaceCommandQueue,
} from './util';
const server = createServer();
const wss = new WebSocketServer({ server });
const board: Board = Array.from({ length: BOARD_SIZE }, (_) =>
  Array.from({ length: BOARD_SIZE }, (__) => null),
);
const placeCommandQueue: PlaceCommandQueue = [];
const rooms: Map<string, Array<WebSocket>> = new Map();

const handleClientCommand = (command: ClientCommand, ws: WebSocket) => {
  console.log(placeCommandQueue);
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      match({
        queueState: getCommandQueueState(placeCommandQueue),
        item: command.payload.item,
      })
        .with(
          { queueState: 'EMPTY', item: 'black' },
          { queueState: 'EMPTY', item: 'white' },
          () => {
            placeCommandQueue.push(command);
          },
        )
        .with(
          { queueState: 'BLACK', item: 'white' },
          { queueState: 'WHITE', item: 'black' },
          () => {
            placeCommandQueue.push(command);
            const placeItemCommands = mergePlaceItemCommand(placeCommandQueue);
            const { isFinish, winner } = updateBoardAndCheckWin(
              board,
              placeItemCommands,
            );
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(placeItemCommands));
            });
            placeCommandQueue.length = 0;
          },
        )
        .otherwise(() => {
          // do nothing
        });
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      const roomId = generateRoomId();
      rooms.set(roomId, [ws]);
      // ws.send(JSON.stringify()); 생성된 roomId 전달
    })
    .with(
      { id: 'JOIN_ROOM' },
      ({ payload: { roomId } }: ClientCommandType<'JOIN_ROOM'>) => {
        const room = rooms.get(roomId);
        match(room)
          .when(
            (room) => room === undefined,
            () => {
              // 존재하지 않는 방 서버 커맨드 보냄.
            },
          )
          .when(
            (room) => room.length === 1,
            (room) => {
              room.push(ws);
            },
          );
      },
    )
    .exhaustive();
};

wss.on('connection', (ws) => {
  match(wss.clients.size)
    .with(1, () =>
      ws.send(
        JSON.stringify(
          makeServerCommand('SET_PLAYER_COLOR', {
            payload: { color: 'black' },
          }),
        ),
      ),
    )
    .with(2, () => {
      wss.clients.forEach((client) =>
        client.send(
          JSON.stringify(makeServerCommand('START_GAME', { payload: {} })),
        ),
      );
      ws.send(
        JSON.stringify(
          makeServerCommand('SET_PLAYER_COLOR', {
            payload: { color: 'white' },
          }),
        ),
      );
    })
    .otherwise(() => {
      ws.send(JSON.stringify('You are not allowed.'));
      ws.close();
    });
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
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('WebSocket server is listening on port 8080');
});

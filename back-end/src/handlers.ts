import { match, P } from 'ts-pattern';
import {
  isValidClientCommand,
  initBoard,
  makeServerCommand,
  updateBoardAndCheckWin,
  mergePlaceItemCommand,
  type ClientCommandType,
} from '@dongsi-omok/shared';
import {
  generateRoomId,
  sendServerCommand,
  getCommandQueueState,
  type Rooms,
  type ClientMap,
  type GameQueue,
} from './util';
import { type Request, type Response } from 'express';

export const handleCommand = (
  req: Request,
  res: Response,
  rooms: Rooms,
  clientMap: ClientMap,
) =>
  match(req.body)
    .when(isValidClientCommand, (cmd) => {
      const roomId = clientMap.get(cmd.playerId);
      if (!roomId) {
        return res.status(404).json({ error: 'RoomId not found' });
      }
      const room = rooms.get(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const clientResponse = room.clients.find(
        ({ clientId }) => clientId === cmd.playerId,
      )?.sseResponse;
      if (!clientResponse) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return match(cmd)
        .with({ id: 'PLACE_ITEM' }, (c: ClientCommandType<'PLACE_ITEM'>) => {
          const queueState = getCommandQueueState(room.queue);
          const { item } = c.payload;

          if (
            (queueState === 'EMPTY' &&
              (item === 'black' || item === 'white')) ||
            (queueState === 'BLACK' && item === 'white') ||
            (queueState === 'WHITE' && item === 'black')
          ) {
            room.queue.push(c);

            if (room.queue.length === 2) {
              const placeItemCommand = mergePlaceItemCommand(room.queue);
              const { isFinish, winner, winningCoordinates } =
                updateBoardAndCheckWin(room.board, placeItemCommand);

              room.clients.forEach(({ sseResponse }) => {
                sendServerCommand(sseResponse, placeItemCommand);
                sendServerCommand(
                  sseResponse,
                  makeServerCommand('NOTIFY_WINNER', {
                    payload: { isFinish, winner, winningCoordinates },
                  }),
                );
              });

              room.queue = [];
            }
          }
          return res
            .status(200)
            .json({ message: 'PLACE_ITEM processed successfully' });
        })
        .with({ id: 'CREATE_ROOM' }, () => {
          // Handle CREATE_ROOM command
          return res
            .status(200)
            .json({ message: 'CREATE_ROOM processed successfully' });
        })
        .with({ id: 'JOIN_ROOM' }, () => {
          // Handle JOIN_ROOM command
          return res
            .status(200)
            .json({ message: 'JOIN_ROOM processed successfully' });
        })
        .with({ id: 'JOIN_QUEUE' }, () => {
          // Handle JOIN_QUEUE command
          return res
            .status(200)
            .json({ message: 'JOIN_QUEUE processed successfully' });
        })
        .with(
          { id: 'REQUEST_REMATCH' },
          (c: ClientCommandType<'REQUEST_REMATCH'>) => {
            const { accept } = c.payload;
            const room = rooms.get(roomId!);
            if (!room) return res.status(404).json({ error: 'Room not found' });

            if (accept) {
              room.rematchRequests.add(cmd.playerId);
              if (room.rematchRequests.size === 2) {
                // 양쪽 모두 동의
                room.clients.forEach(({ sseResponse }) => {
                  sendServerCommand(
                    sseResponse,
                    makeServerCommand('START_REMATCH', { payload: {} }),
                  );
                });
                room.board = initBoard();
                room.rematchRequests.clear();
              } else {
                // 한 쪽만 동의
                room.clients.forEach(({ clientId, sseResponse }) => {
                  if (clientId !== cmd.playerId) {
                    sendServerCommand(
                      sseResponse,
                      makeServerCommand('REMATCH_REQUESTED', {
                        payload: { requesterId: cmd.playerId },
                      }),
                    );
                  }
                });
              }
            } else {
              // 거절
              room.rematchRequests.clear();
              room.clients.forEach(({ clientId, sseResponse }) => {
                sendServerCommand(
                  sseResponse,
                  makeServerCommand('REMATCH_RESPONSE', {
                    payload: { accepted: false, responderId: cmd.playerId },
                  }),
                );
              });
            }
            return res
              .status(200)
              .json({ message: 'REQUEST_REMATCH processed successfully' });
          },
        )
        .exhaustive();
    })
    .otherwise(() => res.status(400).json({ error: 'Invalid command' }));

export const handleSSEConnection = (
  req: Request,
  res: Response,
  rooms: Rooms,
  clientMap: ClientMap,
  gameQueue: GameQueue,
) => {
  console.log('SSE Connection Request Received');
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  const clientId = generateRoomId();
  gameQueue.push({ clientId, sseResponse: res });

  handleGameQueue(rooms, clientMap, gameQueue);

  req.on('close', () =>
    handleClientDisconnection(clientId, rooms, clientMap, gameQueue),
  );
};

function handleGameQueue(
  rooms: Rooms,
  clientMap: ClientMap,
  gameQueue: GameQueue,
) {
  match(gameQueue.length)
    .with(2, () => {
      const roomId = generateRoomId();
      rooms.set(roomId, {
        clients: [...gameQueue],
        queue: [],
        board: initBoard(),
        rematchRequests: new Set(),
      });

      gameQueue.forEach(({ clientId, sseResponse }, idx) => {
        clientMap.set(clientId, roomId);
        sendServerCommand(
          sseResponse,
          makeServerCommand('SET_PLAYER_COLOR', {
            payload: { color: idx === 0 ? 'black' : 'white' },
          }),
        );
        sendServerCommand(
          sseResponse,
          makeServerCommand('START_GAME', {
            payload: {
              playerId: clientId,
            },
          }),
        );
      });

      gameQueue.splice(0, 2);
    })
    .otherwise(() => {});
}

function handleClientDisconnection(
  clientId: string,
  rooms: Rooms,
  clientMap: ClientMap,
  gameQueue: GameQueue,
) {
  const queuedClientIdx = gameQueue.findIndex(
    ({ clientId: _clientId }) => _clientId === clientId,
  );
  if (queuedClientIdx !== -1) {
    gameQueue.splice(queuedClientIdx, 1);
  }

  match(clientMap.get(clientId))
    .with(P.string, (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        const idx = room.clients.findIndex(
          ({ clientId: _clientId }) => _clientId === clientId,
        );
        if (idx !== -1) {
          room.clients.splice(idx, 1);
          room.clients.forEach(({ sseResponse }) => {
            sendServerCommand(
              sseResponse,
              makeServerCommand('LEAVE_OPPONENT', { payload: {} }),
            );
          });
        }
        if (room.clients.length === 0) {
          rooms.delete(roomId);
        }
      }
      clientMap.delete(clientId);
    })
    .otherwise(() => {});
}

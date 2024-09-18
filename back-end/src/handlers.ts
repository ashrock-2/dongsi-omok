import {
  isValidClientCommand,
  initBoard,
  makeServerCommand,
  updateBoardAndCheckWin,
  mergePlaceItemCommand,
  type ClientCommand,
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
import { match } from 'ts-pattern';

export const handleCommand = (
  req: Request,
  res: Response,
  rooms: Rooms,
  clientMap: ClientMap,
) => {
  const command = req.body;
  if (!isValidClientCommand(command)) {
    return res.status(400).json({ error: 'Invalid command' });
  }

  const roomId = clientMap.get(command.playerId);
  if (!roomId) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const clientResponse = room.clients.find(
    ({ clientId }) => clientId === command.playerId,
  )?.sseResponse;

  if (!clientResponse) {
    return res.status(404).json({ error: 'Client not found' });
  }

  match(command)
    .with({ id: 'PLACE_ITEM' }, (cmd: ClientCommandType<'PLACE_ITEM'>) => {
      const queueState = getCommandQueueState(room.queue);
      const { item } = cmd.payload;

      if (
        (queueState === 'EMPTY' && (item === 'black' || item === 'white')) ||
        (queueState === 'BLACK' && item === 'white') ||
        (queueState === 'WHITE' && item === 'black')
      ) {
        room.queue.push(cmd);

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
    })
    .with({ id: 'CREATE_ROOM' }, () => {
      // Handle CREATE_ROOM command
    })
    .with({ id: 'JOIN_ROOM' }, () => {
      // Handle JOIN_ROOM command
    })
    .with({ id: 'JOIN_QUEUE' }, () => {
      // Handle JOIN_QUEUE command
    })
    .exhaustive();

  res.status(200).json({ message: 'Command processed successfully' });
};

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

  if (gameQueue.length === 2) {
    const roomId = generateRoomId();
    rooms.set(roomId, {
      clients: [...gameQueue],
      queue: [],
      board: initBoard(),
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
  }

  req.on('close', () => {
    const queuedClientIdx = gameQueue.findIndex(
      ({ clientId: _clientId }) => _clientId === clientId,
    );
    if (queuedClientIdx !== -1) {
      gameQueue.splice(queuedClientIdx, 1);
    }

    const roomId = clientMap.get(clientId);
    if (roomId) {
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
    }
  });
};

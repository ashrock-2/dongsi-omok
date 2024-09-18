import {
  initBoard,
  isValidClientCommand,
  makeServerCommand,
} from '@dongsi-omok/shared';
import { createServer } from 'http';
import {
  generateRoomId,
  sendServerCommand,
  type ClientMap,
  type GameQueue,
  type Rooms,
} from './util';
import { handleClientCommand } from './handleClientCommand';
import express from 'express';

const app = express();
const server = createServer(app);
const rooms: Rooms = new Map();
const clientMap: ClientMap = new Map();
const gameQueue: GameQueue = [];

app.post('/api/command', (req, res) => {
  const command = req.body;
  if (isValidClientCommand(command)) {
    handleClientCommand(command, req, res, rooms, clientMap, gameQueue);
  } else {
    res.status(400).json({ error: 'Invalid command' });
  }
});

app.get('/api/events', (req, res) => {
  console.log('SSE Connection Request Received');
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': 'http://localhost:4321',
    'Access-Control-Allow-Credentials': 'true',
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
      ),
        sendServerCommand(
          sseResponse,
          makeServerCommand('START_GAME', { payload: {} }),
        );
    });
    gameQueue.splice(0, 2);
  }
  // TODO: 브라우저 닫아도 이벤트 호출 안되고 있음.
  req.on('close', () => {
    const queuedClientIdx = gameQueue.findIndex(
      ({ clientId: _clientId }) => _clientId === clientId,
    );
    console.log(queuedClientIdx);
    if (queuedClientIdx !== -1) {
      gameQueue.splice(queuedClientIdx, 1);
    }
    const roomId = clientMap.get(clientId);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const idx = room.clients.findIndex(
      ({ clientId: _clientId }) => _clientId === clientId,
    );
    if (idx !== -1) {
      room.clients.splice(idx, 1);
      const [client] = room.clients;
      sendServerCommand(
        res,
        makeServerCommand('LEAVE_OPPONENT', { payload: {} }),
      );
    }
    if (room.clients.length === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

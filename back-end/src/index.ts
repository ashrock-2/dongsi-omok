import { isValidClientCommand, makeServerCommand } from '@dongsi-omok/shared';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { type Rooms } from './util';
import { handleClientCommand } from './handleClientCommand';
const server = createServer();
const wss = new WebSocketServer({ server });
const rooms: Rooms = new Map();
const clientMap: Map<WebSocket, string> = new Map();
const gameQueue: Array<WebSocket> = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (isValidClientCommand(parsedMessage)) {
        handleClientCommand(parsedMessage, ws, rooms, clientMap, gameQueue);
      }
    } catch (err) {
      console.error('Failed to parse message', err);
    }
  });

  ws.on('close', (code) => {
    const roomId = clientMap.get(ws);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    const idx = room.clients.findIndex((client) => client === ws);
    if (idx !== -1) {
      room.clients.splice(idx, 1);
      const [client] = room.clients;
      client?.send(
        JSON.stringify(makeServerCommand('LEAVE_OPPONENT', { payload: {} })),
      );
    }
    if (room.clients.length === 0) {
      rooms.delete(roomId);
    }
  });
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});

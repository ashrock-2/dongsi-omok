import { isValidClientCommand, makeServerCommand } from '@dongsi-omok/shared';
import { createServer } from 'http';
import { type ClientMap, type GameQueue, type Rooms } from './util';
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
  // console.log(req.body);
  res.writeHead(200, headers);
  const intervalId = setInterval(() => {
    res.write(
      `data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`,
    );
  }, 1000);

  // res.json(
  //   makeServerCommand('SET_PLAYER_COLOR', { payload: { color: 'black' } }),
  // );
  // gameQueue.push(res);
  req.on('close', () => {});
});

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     try {
//       const parsedMessage = JSON.parse(message.toString());
//       if (isValidClientCommand(parsedMessage)) {
//         handleClientCommand(parsedMessage, ws, rooms, clientMap, gameQueue);
//       }
//     } catch (err) {
//       console.error('Failed to parse message', err);
//     }
//   });

//   ws.on('close', () => {
//     const queuedClientIdx = gameQueue.findIndex((client) => client === ws);
//     if (queuedClientIdx !== -1) {
//       gameQueue.splice(queuedClientIdx, 1);
//     }
//     const roomId = clientMap.get(ws);
//     if (!roomId) return;
//     const room = rooms.get(roomId);
//     if (!room) return;

//     const idx = room.clients.findIndex((client) => client === ws);
//     if (idx !== -1) {
//       room.clients.splice(idx, 1);
//       const [client] = room.clients;
//       client?.send(
//         JSON.stringify(makeServerCommand('LEAVE_OPPONENT', { payload: {} })),
//       );
//     }
//     if (room.clients.length === 0) {
//       rooms.delete(roomId);
//     }
//   });
// });

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

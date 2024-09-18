import { createServer } from 'http';
import { type ClientMap, type GameQueue, type Rooms } from './util';
import express from 'express';
import cors from 'cors';
import { handleCommand, handleSSEConnection } from './handlers';

const app = express();
const server = createServer(app);
const rooms: Rooms = new Map();
const clientMap: ClientMap = new Map();
const gameQueue: GameQueue = [];

app.use(
  cors({
    origin: 'http://localhost:4321',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Client-ID'],
  }),
);
app.use(express.json());
app.post('/api/command', (req, res) => {
  handleCommand(req, res, rooms, clientMap);
});
app.get('/api/events', (req, res) => {
  handleSSEConnection(req, res, rooms, clientMap, gameQueue);
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

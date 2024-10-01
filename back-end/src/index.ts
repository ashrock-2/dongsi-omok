import { type ClientMap, type GameQueue, type Rooms } from './util';
import express from 'express';
import cors from 'cors';
import { handleCommand, handleSSEConnection } from './handlers';

const app = express();
const rooms: Rooms = new Map();
const clientMap: ClientMap = new Map();
const gameQueue: GameQueue = [];

const ALLOWED_ORIGINS = [
  'http://localhost:4321',
  'https://dongsi-omok.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
     if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
  console.log(rooms.size);
  handleSSEConnection(req, res, rooms, clientMap, gameQueue);
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});

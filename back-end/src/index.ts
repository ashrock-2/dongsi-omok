import {
  type ClientCommandType,
  type ClientCommand,
  isValidClientCommand,
  makeServerCommand,
} from '@dongsi-omok/shared';
import { createServer } from 'http';
import { match } from 'ts-pattern';
import { WebSocketServer } from 'ws';
import {
  getCommandQueueState,
  mergePlaceItemCommand,
  type PlaceCommandQueue,
} from './util';
const server = createServer();
const wss = new WebSocketServer({ server });
const placeCommandQueue: PlaceCommandQueue = [];

const handleClientCommand = (command: ClientCommand) => {
  console.log(placeCommandQueue);
  match(command)
    .with({ id: 'PLACE_ITEM' }, (command: ClientCommandType<'PLACE_ITEM'>) => {
      match({
        queueState: getCommandQueueState(placeCommandQueue),
        player: command.player,
      })
        .with(
          { queueState: 'EMPTY', player: 'black' },
          { queueState: 'EMPTY', player: 'white' },
          () => {
            placeCommandQueue.push(command);
          },
        )
        .with(
          { queueState: 'BLACK', player: 'white' },
          { queueState: 'WHITE', player: 'black' },
          () => {
            placeCommandQueue.push(command);
            const placeItemCommands = mergePlaceItemCommand(placeCommandQueue);
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(placeItemCommands));
            });
            placeCommandQueue.length = 0;
          },
        )
        .with(
          { queueState: 'BLACK', player: 'black' },
          { queueState: 'WHITE', player: 'white' },
          { queueState: 'FULL', player: 'black' },
          { queueState: 'FULL', player: 'white' },
          () => {
            // do nothing
          },
        )
        .exhaustive();
    })
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
    .with(2, () =>
      ws.send(
        JSON.stringify(
          makeServerCommand('SET_PLAYER_COLOR', {
            payload: { color: 'white' },
          }),
        ),
      ),
    )
    .otherwise(() => {
      ws.send(JSON.stringify('You are not allowed.'));
      ws.close();
    });
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (isValidClientCommand(parsedMessage)) {
        handleClientCommand(parsedMessage);
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

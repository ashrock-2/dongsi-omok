import {
  type ClientCommandType,
  type ClientCommand,
  isValidClientCommand,
} from '@dongsi-omok/shared';
import { createServer } from 'http';
import { match } from 'ts-pattern';
import { WebSocketServer } from 'ws';
const server = createServer();
const wss = new WebSocketServer({ server });
const commands: Array<ClientCommandType<'PLACE'>> = [];

const mergePlaceCommand = (commands: Array<ClientCommandType<'PLACE'>>) => {
  const [command1, command2] = commands;
  if (
    command1.payload.row === command2.payload.row &&
    command1.payload.col === command2.payload.col
  ) {
    const mergedCommand: ClientCommandType<'PLACE'> = {
      id: 'PLACE',
      // TODO: ServerCommand로 변경
      player: 'white',
      payload: {
        item: 'prohibit',
        row: command1.payload.row,
        col: command1.payload.col,
      },
    };
    return [mergedCommand];
  }
  return commands;
};

const handleClientCommand = (command: ClientCommand) => {
  match(command)
    .with({ id: 'PLACE' }, (command) => {
      commands.push(command);
      if (commands.length === 2) {
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(mergePlaceCommand(commands)));
        });
        commands.pop();
        commands.pop();
      }
    })
    .exhaustive();
};

wss.on('connection', (ws) => {
  match(wss.clients.size)
    .with(1, () => ws.send(JSON.stringify('You are Black')))
    .with(2, () => ws.send(JSON.stringify('You are White')))
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

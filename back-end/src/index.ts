import { ClientCommands, type ClientCommandType, type ClientCommandPayloadRegistry, type ClientCommand, type KeyOfClientCommands } from "@dongsi-omok/shared";
import { createServer } from "http";
import { match } from "ts-pattern";
import { WebSocketServer } from "ws";
const server = createServer();
const wss = new WebSocketServer({ server });
const actions: Array<ClientCommandType<'PLACE'>> = [];

const isValidAction = (action: unknown): action is ClientCommand => {
  if (typeof action !== 'object' || action === null) return false;
  if (!('id' in action) || !('payload' in action)) return false;

  const id = action.id as KeyOfClientCommands;
  if (!(id in ClientCommands)) return false;

  const payload = action.payload as ClientCommandPayloadRegistry[typeof id];
  return payload !== undefined;
};

const mergePlaceAction = (actions: Array<ClientCommandType<'PLACE'>>) => {
  const [action1, action2] = actions;
  if (action1.payload.row === action2.payload.row && action1.payload.col === action2.payload.col) {
    const mergedAction: ClientCommandType<'PLACE'> = {
      id: 'PLACE',
      payload: {
        item: 'prohibit',
        row: action1.payload.row,
        col: action1.payload.col,
      }
    }
    return [mergedAction];
  }
  return actions;
};

const handleAction = (action: ClientCommand) => {
  match(action).with({ id: 'PLACE'}, (action) => {
    actions.push(action);
    if (actions.length === 2) {
      wss.clients.forEach((client) => {
          client.send(JSON.stringify(mergePlaceAction(actions)));
      });
      actions.pop();
      actions.pop();
    }
  }).exhaustive();
}

wss.on("connection", (ws) => {
  match(wss.clients.size)
    .with(1, () => ws.send(JSON.stringify('You are Black')))
    .with(2, () => ws.send(JSON.stringify('You are White')))
    .otherwise(() => ws.send(JSON.stringify('You are now allowed.')));

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (isValidAction(parsedMessage)) {
        handleAction(parsedMessage);
      }
    } catch (err) {
      console.error("Failed to parse message", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8080, () => {
  console.log("WebSocket server is listening on port 8080");
});

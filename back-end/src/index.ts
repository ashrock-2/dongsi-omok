import { ACTION_TYPES, type ACTION_TYPE, type ActionPayloadRegistry, type AnyActionType, type KeyOfActionTypes } from "@dongsi-omok/shared";
import { createServer } from "http";
import { match } from "ts-pattern";
import { WebSocketServer } from "ws";
const server = createServer();
const wss = new WebSocketServer({ server });
const actions: Array<ACTION_TYPE<'PLACE'>> = [];

const isValidAction = (action: unknown): action is AnyActionType => {
  if (typeof action !== 'object' || action === null) return false;
  if (!('id' in action) || !('payload' in action)) return false;

  const id = action.id as KeyOfActionTypes;
  if (!(id in ACTION_TYPES)) return false;

  const payload = action.payload as ActionPayloadRegistry[typeof id];
  return payload !== undefined;
};

const mergePlaceAction = (actions: Array<ACTION_TYPE<'PLACE'>>) => {
  const [action1, action2] = actions;
  if (action1.payload.row === action2.payload.row && action1.payload.col === action2.payload.col) {
    const mergedAction: ACTION_TYPE<'PLACE'> = {
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

const handleAction = (action: AnyActionType) => {
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

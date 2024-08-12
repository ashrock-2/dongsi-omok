import { ACTION_TYPES, type ACTION_TYPE, type ActionPayloadRegistry, type AnyActionType, type KeyOfActionTypes } from "@dongsi-omok/shared";
import { createServer } from "http";
import { match } from "ts-pattern";
import { WebSocketServer } from "ws";
const server = createServer();
const wss = new WebSocketServer({ server });
const actions: Array<AnyActionType> = [];

const isValidAction = (action: unknown): action is AnyActionType => {
  if (typeof action !== 'object' || action === null) return false;
  if (!('id' in action) || !('payload' in action)) return false;

  const id = action.id as KeyOfActionTypes;
  if (!(id in ACTION_TYPES)) return false;

  const payload = action.payload as ActionPayloadRegistry[typeof id];
  return payload !== undefined;
};

const handleAction = (action: AnyActionType) => {
  match(action).with({ id: 'PLACE'}, ({payload}) => {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(action));
      }
    });
  }).exhaustive();
}

wss.on("connection", (ws) => {
  console.log("New client connected");

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

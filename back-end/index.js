import { createServer } from "http";
import { WebSocketServer } from "ws";

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8080, () => {
  console.log("WebSocket server is listening on port 8080");
});

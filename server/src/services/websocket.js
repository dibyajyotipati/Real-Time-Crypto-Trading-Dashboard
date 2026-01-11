import { WebSocketServer } from "ws";
import redis from "../config/redisClient.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("Client connected to WebSocket");
        wss.emit("connection", ws, req);
      });
    }
  });

  redis.subscribe("btc_price", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  });
}

import { WebSocketServer } from "ws";
import redisClient from "../config/redisClient.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("Client connected to WebSocket");
        ws.send(JSON.stringify({ message: "connected" }));
        wss.emit("connection", ws, req);
      });
    }
  });

  // Dedicated subscriber
  const subscriber = redisClient.duplicate();

  subscriber.subscribe("price_updates", (err) => {
    if (err) console.error("Redis subscribe error:", err);
    else console.log("Subscribed to price_updates");
  });

  subscriber.on("message", (channel, message) => {
    console.log("Forwarding to clients:", message);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  });
}

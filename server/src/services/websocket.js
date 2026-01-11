import { WebSocketServer } from "ws";
import redisSubscriber from "../config/redisSubscriber.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade requests from client
  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("Client connected to WebSocket");
        ws.send(JSON.stringify({ message: "connected" }));
      });
    }
  });

  // Subscribe to Redis channel
  redisSubscriber.subscribe("btc_price", (err) => {
    if (err) console.error("Redis subscribe error:", err);
    else console.log("Subscribed to btc_price channel");
  });

  // Receive price updates from Redis
  redisSubscriber.on("message", (channel, message) => {
    console.log("Redis message received:", message);

    // Send to all WS clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        console.log("Forwarding to clients:", message);
        client.send(message);
      }
    });
  });
}

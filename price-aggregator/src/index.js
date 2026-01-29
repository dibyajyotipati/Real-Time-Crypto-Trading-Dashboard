import WebSocket from "ws";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

// Coins we want
const symbols = ["btcusdt", "ethusdt", "solusdt"];
const streams = symbols.map((s) => `${s}@trade`).join("/");

const ws = new WebSocket(
  `wss://stream.binance.com:9443/stream?streams=${streams}`
);

ws.on("open", () => {
  console.log("Connected to Binance WebSocket (Multi-Coin)");
});

ws.on("message", async (data) => {
  const msg = JSON.parse(data);
  const trade = msg.data;

  if (!trade) return;

  const symbol = trade.s;   // BTCUSDT, ETHUSDT, SOLUSDT
  const price = trade.p;

  console.log(`Published: ${symbol} ${price}`);

  // Save latest price in Redis
  await redis.set(symbol, price);

  // Publish to backend
  await redis.publish(
    "price_updates",
    JSON.stringify({ symbol, price })
  );
});

ws.on("error", (err) => {
  console.error("Binance WS error:", err);
});

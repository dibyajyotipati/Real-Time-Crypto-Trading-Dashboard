import WebSocket from "ws";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

// Coins
const symbols = ["btcusdt", "ethusdt", "solusdt"];
const streams = symbols.map((s) => `${s}@trade`).join("/");

const ws = new WebSocket(
  `wss://stream.binance.com:9443/stream?streams=${streams}`
);

// Buffer for 1-minute candles
const candleBuffer = {};

ws.on("open", () => {
  console.log("Connected to Binance WebSocket (Multi-Coin)");
});

ws.on("message", async (data) => {
  const msg = JSON.parse(data);
  const trade = msg.data;
  if (!trade) return;

  const symbol = trade.s;               // BTCUSDT, ETHUSDT, SOLUSDT
  const price = parseFloat(trade.p);    // number
  const now = Date.now();

  console.log(`Live: ${symbol} ${price}`);

  // 🔴 REAL-TIME (for UI)
  await redis.publish(
    "price_updates",
    JSON.stringify({ symbol, price })
  );

  // 🟢 CANDLE LOGIC (1 minute)
  const minute = Math.floor(now / 60000) * 60000;

  if (!candleBuffer[symbol] || candleBuffer[symbol].minute !== minute) {

    // Save previous candle
    if (candleBuffer[symbol]) {
      const candle = candleBuffer[symbol];

      try {
        await fetch("http://localhost:5000/api/candle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: candle.symbol,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            timestamp: new Date(candle.minute)
          })
        });

        console.log("Saved candle:", candle.symbol, new Date(candle.minute));
      } catch (err) {
        console.error("Candle save failed:", err.message);
      }
    }

    // Start new candle
    candleBuffer[symbol] = {
      symbol,
      open: price,
      high: price,
      low: price,
      close: price,
      minute
    };

  } else {
    const c = candleBuffer[symbol];
    c.high = Math.max(c.high, price);
    c.low = Math.min(c.low, price);
    c.close = price;
  }
});

ws.on("error", (err) => {
  console.error("Binance WS error:", err);
});

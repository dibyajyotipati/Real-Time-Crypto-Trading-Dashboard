import WebSocket from "ws";

export const connectBinanceWS = (symbol, onMessage) => {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

  ws.on("open", () => console.log(`🔗 Connected to Binance for ${symbol}`));

  ws.on("message", (data) => {
    const parsed = JSON.parse(data);
    onMessage(parsed.p); // price from trade message
  });

  ws.on("close", () => {
    console.log("❌ Binance WebSocket closed. Reconnecting...");
    setTimeout(() => connectBinanceWS(symbol, onMessage), 3000);
  });

  ws.on("error", (err) => console.error("WS Error:", err));
};

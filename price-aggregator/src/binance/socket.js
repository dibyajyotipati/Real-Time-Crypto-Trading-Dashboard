import WebSocket from "ws";
import { redisPublisher } from "../redis/redisClient.js";

const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");

ws.on("message", async (data) => {
  const json = JSON.parse(data);

  const priceData = {
    symbol: json.s,
    price: json.c
  };

  console.log("Binance Stream Price:", priceData.price);

  await redisPublisher.publish("btc_price", JSON.stringify(priceData));
});

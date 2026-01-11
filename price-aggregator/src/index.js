import dotenv from "dotenv";
import { redisClient } from "./redis/redisClient.js";
import { connectBinanceWS } from "./binance/socket.js";

dotenv.config();

const SYMBOL = "btcusdt";

connectBinanceWS(SYMBOL, async (price) => {
  await redisClient.set("BTC_PRICE", price);
  console.log("Updated BTC Price:", price);
});

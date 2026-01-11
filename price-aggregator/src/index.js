import axios from "axios";
import { redisPublisher } from "./redis/redisClient.js";

async function fetchPrice() {
  try {
    const res = await axios.get(
      "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
    );

    const priceData = {
      symbol: "BTCUSDT",
      price: res.data.price,
    };

    console.log("Fetched BTC Price:", priceData.price);

    // Publish to Redis channel
    await redisPublisher.publish("btc_price", JSON.stringify(priceData));
    console.log("Published:", priceData);

  } catch (err) {
    console.error("Error fetching BTC price:", err);
  }
}

setInterval(fetchPrice, 2000);

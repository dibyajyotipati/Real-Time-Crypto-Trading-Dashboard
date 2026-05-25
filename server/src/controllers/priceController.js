import redisClient from "../config/redisClient.js";

export const getLatestPrice = async (req, res) => {
  try {
    const price = await redisClient.get("BTC_PRICE");

    if (!price) {
      return res.status(404).json({ message: "Price not available yet" });
    }

    res.json({
      symbol: "BTCUSDT",
      price,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

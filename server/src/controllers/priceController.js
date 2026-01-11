import  redisClient  from "../config/redisClient.js";

export const getBTCPrice = async (req, res) => {
  try {
    const price = await redisClient.get("BTC_PRICE");
    res.json({ symbol: "BTCUSDT", price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

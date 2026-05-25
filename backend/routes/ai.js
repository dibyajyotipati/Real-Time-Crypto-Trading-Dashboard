const router = require('express').Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

const AI_PREDICTOR_URL = process.env.AI_PREDICTOR_URL || 'http://localhost:5002';
const AGGREGATOR_URL = process.env.PRICE_AGGREGATOR_URL || 'http://localhost:5001';

// GET /api/ai/signal/:symbol
router.get('/signal/:symbol', authMiddleware, async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  try {
    // Fetch price history + current price to enrich the AI signal
    let priceHistory = [];
    let currentPrice = 0;

    try {
      const [histRes, priceRes] = await Promise.all([
        axios.get(`${AGGREGATOR_URL}/history/${symbol.toLowerCase()}?interval=1h&limit=24`, { timeout: 8000 }),
        axios.get(`${AGGREGATOR_URL}/price/${symbol.toLowerCase()}`, { timeout: 5000 })
      ]);
      priceHistory = histRes.data;
      currentPrice = priceRes.data.price;
    } catch (e) {
      console.log('Could not enrich signal data:', e.message);
    }

    const { data } = await axios.post(
      `${AI_PREDICTOR_URL}/signal`,
      { symbol, priceHistory, currentPrice },
      { timeout: 15000 }
    );

    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'AI predictor unavailable' });
  }
});

module.exports = router;

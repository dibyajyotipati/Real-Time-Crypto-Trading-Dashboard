const router = require('express').Router();
const axios = require('axios');

const AGGREGATOR_URL = process.env.PRICE_AGGREGATOR_URL || 'http://localhost:5001';

// GET /api/market/prices
router.get('/prices', async (req, res) => {
  try {
    const { data } = await axios.get(`${AGGREGATOR_URL}/prices`, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Price aggregator unavailable' });
  }
});

// GET /api/market/price/:symbol
router.get('/price/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get(`${AGGREGATOR_URL}/price/${req.params.symbol}`, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'Symbol not found' });
    res.status(502).json({ error: 'Price aggregator unavailable' });
  }
});

// GET /api/market/history/:symbol
router.get('/history/:symbol', async (req, res) => {
  const { interval = '1h', limit = 100 } = req.query;
  try {
    const { data } = await axios.get(
      `${AGGREGATOR_URL}/history/${req.params.symbol}?interval=${interval}&limit=${limit}`,
      { timeout: 10000 }
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;

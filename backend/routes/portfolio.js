const router = require('express').Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Holding = require('../models/Holding');

const AGGREGATOR_URL = process.env.PRICE_AGGREGATOR_URL || 'http://localhost:5001';

// GET /api/portfolio
router.get('/', authMiddleware, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id, quantity: { $gt: 0 } });

    // Fetch all current prices
    let prices = {};
    try {
      const { data } = await axios.get(`${AGGREGATOR_URL}/prices`, { timeout: 5000 });
      prices = data;
    } catch (e) {
      console.log('Price fetch failed, using 0');
    }

    const portfolioItems = holdings.map(h => {
      const symbolKey = h.symbol.toLowerCase() + 'usdt';
      const currentPrice = prices[symbolKey]?.price || 0;
      const currentValue = currentPrice * h.quantity;
      const invested = h.avgBuyPrice * h.quantity;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

      return {
        symbol: h.symbol,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        currentValue,
        invested,
        pnl,
        pnlPercent
      };
    });

    const totalInvested = portfolioItems.reduce((sum, item) => sum + item.invested, 0);
    const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    res.json({
      holdings: portfolioItems,
      balance: req.user.balance,
      totalInvested,
      totalValue,
      totalPnl,
      totalPnlPercent,
      netWorth: req.user.balance + totalValue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portfolio/balance
router.get('/balance', authMiddleware, async (req, res) => {
  res.json({ balance: req.user.balance });
});

module.exports = router;

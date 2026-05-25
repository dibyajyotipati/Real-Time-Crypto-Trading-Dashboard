const router = require('express').Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Trade = require('../models/Trade');
const Holding = require('../models/Holding');
const User = require('../models/User');

const AGGREGATOR_URL = process.env.PRICE_AGGREGATOR_URL || 'http://localhost:5001';

async function getCurrentPrice(symbol) {
  const { data } = await axios.get(`${AGGREGATOR_URL}/price/${symbol.toLowerCase()}`, { timeout: 5000 });
  return data.price;
}

// POST /api/trades/buy
router.post('/buy', authMiddleware, async (req, res) => {
  const { symbol, quantity } = req.body;

  if (!symbol || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Valid symbol and quantity required' });
  }

  try {
    const price = await getCurrentPrice(symbol);
    const total = price * quantity;

    if (req.user.balance < total) {
      return res.status(400).json({ error: 'Insufficient balance', required: total, available: req.user.balance });
    }

    const balanceBefore = req.user.balance;
    req.user.balance -= total;
    await req.user.save();

    // Update or create holding
    let holding = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });
    if (holding) {
      const totalQty = holding.quantity + quantity;
      holding.avgBuyPrice = ((holding.avgBuyPrice * holding.quantity) + (price * quantity)) / totalQty;
      holding.quantity = totalQty;
      holding.totalInvested += total;
    } else {
      holding = new Holding({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        quantity,
        avgBuyPrice: price,
        totalInvested: total
      });
    }
    await holding.save();

    const trade = new Trade({
      user: req.user._id,
      type: 'BUY',
      symbol: symbol.toUpperCase(),
      quantity,
      price,
      total,
      balanceBefore,
      balanceAfter: req.user.balance
    });
    await trade.save();

    res.json({
      success: true,
      trade,
      newBalance: req.user.balance,
      holding
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trades/sell
router.post('/sell', authMiddleware, async (req, res) => {
  const { symbol, quantity } = req.body;

  if (!symbol || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Valid symbol and quantity required' });
  }

  try {
    const holding = await Holding.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient holdings',
        available: holding?.quantity || 0
      });
    }

    const price = await getCurrentPrice(symbol);
    const total = price * quantity;
    const balanceBefore = req.user.balance;

    req.user.balance += total;
    await req.user.save();

    holding.quantity -= quantity;
    holding.totalInvested -= (holding.avgBuyPrice * quantity);
    if (holding.quantity <= 0) {
      await holding.deleteOne();
    } else {
      await holding.save();
    }

    const trade = new Trade({
      user: req.user._id,
      type: 'SELL',
      symbol: symbol.toUpperCase(),
      quantity,
      price,
      total,
      balanceBefore,
      balanceAfter: req.user.balance
    });
    await trade.save();

    res.json({
      success: true,
      trade,
      newBalance: req.user.balance,
      pnl: (price - holding.avgBuyPrice) * quantity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/trades/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, symbol } = req.query;
    const query = { user: req.user._id };
    if (symbol) query.symbol = symbol.toUpperCase();

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments(query);

    res.json({ trades, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import express from "express";
import Candle from "../models/Candle.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST candle (used by aggregator)
router.post("/", async (req, res) => {
  try {
    const candle = await Candle.create(req.body);
    res.status(201).json(candle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET candle history (sorted by time ASC)
router.get("/:symbol", authMiddleware, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const candles = await Candle.find({ symbol })
      .sort({ timestamp: 1 })   // ✅ IMPORTANT
      .limit(200);

    res.json(candles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

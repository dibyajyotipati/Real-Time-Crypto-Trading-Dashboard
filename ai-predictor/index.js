require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('✅ Gemini AI initialized');
} else {
  console.log('⚠️  No GEMINI_API_KEY found - will use mock signals');
}

// In-memory signal cache (5 min TTL)
const signalCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getMockSignal(symbol) {
  const signals = ['BUY', 'SELL', 'HOLD'];
  const signal = signals[Math.floor(Math.random() * signals.length)];
  const confidence = Math.floor(Math.random() * 30) + 60; // 60–90%

  const reasoningMap = {
    BUY: `${symbol} shows bullish momentum with strong volume support. RSI approaching oversold territory suggesting potential upside.`,
    SELL: `${symbol} appears overbought with weakening momentum indicators. Risk/reward ratio unfavorable at current levels.`,
    HOLD: `${symbol} is consolidating. Mixed signals from momentum and volume indicators suggest waiting for clearer direction.`
  };

  return {
    signal,
    confidence,
    reasoning: reasoningMap[signal],
    indicators: {
      trend: signal === 'BUY' ? 'Bullish' : signal === 'SELL' ? 'Bearish' : 'Neutral',
      momentum: `${(Math.random() * 40 + 30).toFixed(1)}`,
      volume: signal === 'HOLD' ? 'Average' : 'Above Average',
      support: `Strong`,
    },
    generatedAt: new Date().toISOString(),
    mock: true
  };
}

async function generateSignal(symbol, priceHistory, currentPrice) {
  // Check cache
  const cached = signalCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  if (!model) {
    const mockData = getMockSignal(symbol);
    signalCache.set(symbol, { data: mockData, timestamp: Date.now() });
    return mockData;
  }

  try {
    // Build price context for Gemini
    const recentPrices = priceHistory.slice(-20).map(p =>
      `Time: ${new Date(p.time).toISOString()}, O: ${p.open}, H: ${p.high}, L: ${p.low}, C: ${p.close}, Vol: ${p.volume}`
    ).join('\n');

    const prompt = `You are a crypto trading analyst. Analyze the following ${symbol}/USDT price data and provide a trading signal.

Current Price: $${currentPrice}

Recent OHLCV Data (last 20 candles):
${recentPrices}

Based on this price action, provide:
1. Signal: BUY, SELL, or HOLD
2. Confidence: percentage (0-100)
3. Brief reasoning (2-3 sentences max)
4. Key indicators summary

Respond ONLY in this exact JSON format:
{
  "signal": "BUY|SELL|HOLD",
  "confidence": 75,
  "reasoning": "Brief reasoning here",
  "indicators": {
    "trend": "Bullish|Bearish|Neutral",
    "momentum": "Strong|Weak|Neutral",
    "volume": "High|Low|Average",
    "support": "Strong|Weak"
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    const signalData = {
      ...parsed,
      generatedAt: new Date().toISOString(),
      mock: false
    };

    signalCache.set(symbol, { data: signalData, timestamp: Date.now() });
    return signalData;

  } catch (err) {
    console.error('Gemini error:', err.message);
    const mockData = getMockSignal(symbol);
    signalCache.set(symbol, { data: mockData, timestamp: Date.now() });
    return mockData;
  }
}

// POST /signal — accepts symbol, priceHistory, currentPrice
app.post('/signal', async (req, res) => {
  const { symbol, priceHistory = [], currentPrice } = req.body;

  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  try {
    const signal = await generateSignal(symbol.toUpperCase(), priceHistory, currentPrice);
    res.json({ symbol, ...signal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /signal/:symbol — shortcut with optional current price query param
app.get('/signal/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const currentPrice = parseFloat(req.query.price) || 0;

  try {
    const signal = await generateSignal(symbol, [], currentPrice);
    res.json({ symbol, ...signal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', gemini: !!model }));

app.listen(PORT, () => {
  console.log(`🤖 AI Predictor running on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Supported trading pairs
const SYMBOLS = [
  'btcusdt', 'ethusdt', 'bnbusdt', 'solusdt',
  'adausdt', 'dogeusdt', 'xrpusdt', 'dotusdt'
];

// In-memory price store (fallback if Redis unavailable)
const priceCache = {};

// Redis client
let redisClient = null;

async function initRedis() {
  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.log('Redis error (non-fatal):', err.message));
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.log('⚠️  Redis unavailable, using in-memory cache');
    redisClient = null;
  }
}

async function setPrice(symbol, data) {
  priceCache[symbol] = data;
  if (redisClient) {
    try {
      await redisClient.setEx(`price:${symbol}`, 10, JSON.stringify(data));
    } catch (e) {}
  }
}

async function getPrice(symbol) {
  if (redisClient) {
    try {
      const cached = await redisClient.get(`price:${symbol}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  return priceCache[symbol] || null;
}

async function getAllPrices() {
  const prices = {};
  for (const sym of SYMBOLS) {
    prices[sym] = await getPrice(sym);
  }
  return prices;
}

// Connected frontend clients
const clients = new Set();

// Broadcast price update to all connected frontend clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// WebSocket server for frontend clients
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);

  // Send current prices immediately on connect
  getAllPrices().then(prices => {
    ws.send(JSON.stringify({ type: 'snapshot', prices }));
  });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'subscribe') {
        ws.subscribedSymbols = data.symbols || SYMBOLS;
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', () => clients.delete(ws));
});

// Connect to Binance WebSocket streams
function connectBinance() {
  const streams = SYMBOLS.map(s => `${s}@ticker`).join('/');
  const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  console.log('🔗 Connecting to Binance WebSocket...');
  const binanceWs = new WebSocket(url);

  binanceWs.on('open', () => {
    console.log('✅ Binance WebSocket connected');
  });

  binanceWs.on('message', async (raw) => {
    try {
      const { data } = JSON.parse(raw);
      const symbol = data.s.toLowerCase(); // e.g. "btcusdt"

      const priceData = {
        symbol: data.s,
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        changeAbs: parseFloat(data.p),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        volume24h: parseFloat(data.v),
        quoteVolume: parseFloat(data.q),
        timestamp: Date.now()
      };

      await setPrice(symbol, priceData);

      broadcast({ type: 'price_update', symbol, data: priceData });
    } catch (err) {
      // ignore malformed
    }
  });

  binanceWs.on('close', () => {
    console.log('⚠️  Binance WS disconnected. Reconnecting in 5s...');
    setTimeout(connectBinance, 5000);
  });

  binanceWs.on('error', (err) => {
    console.log('Binance WS error:', err.message);
  });
}

// REST endpoints for backend microservice calls
app.get('/health', (req, res) => res.json({ status: 'ok', clients: clients.size }));

app.get('/prices', async (req, res) => {
  const prices = await getAllPrices();
  res.json(prices);
});

app.get('/price/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toLowerCase() + 'usdt';
  const price = await getPrice(symbol);
  if (!price) return res.status(404).json({ error: 'Symbol not found' });
  res.json(price);
});

// Simulate price history for charts (in real app, you'd store tick data)
app.get('/history/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1h', limit = 100 } = req.query;

  // Fetch from Binance REST API for historical klines
  const binanceSymbol = symbol.toUpperCase() + 'USDT';
  const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const klines = await response.json();

    const history = klines.map(k => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

async function start() {
  await initRedis();
  connectBinance();
  server.listen(PORT, () => {
    console.log(`🚀 Price Aggregator running on port ${PORT}`);
  });
}

start();

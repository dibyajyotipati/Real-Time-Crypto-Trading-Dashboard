# 🚀 Real-Time Crypto Trading Dashboard

A full-stack crypto trading simulator with live prices, AI predictions, and virtual portfolio management.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts, WebSockets
- **Backend**: Node.js, Express.js, MongoDB, Redis, JWT Auth
- **Price Aggregator**: Node.js microservice streaming live Binance prices via WebSocket
- **AI Predictor**: Node.js microservice using Google Gemini AI for buy/sell/hold signals

---

## Project Structure

```
crypto-trading/
├── frontend/          # React.js frontend
├── backend/           # Main API server (Express + MongoDB)
├── price-aggregator/  # WebSocket price streaming microservice
├── ai-predictor/      # Gemini AI signal microservice
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)
- Google Gemini API Key → https://aistudio.google.com/
- Binance public WebSocket (no API key needed for prices)

---

## Quick Start

### 1. Clone & Install
```bash
npm run install:all
```

### 2. Set Up Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cryptotrading
JWT_SECRET=your_super_secret_jwt_key_here
REDIS_URL=redis://localhost:6379
PRICE_AGGREGATOR_URL=http://localhost:5001
AI_PREDICTOR_URL=http://localhost:5002
```

**price-aggregator/.env**
```
PORT=5001
REDIS_URL=redis://localhost:6379
```

**ai-predictor/.env**
```
PORT=5002
GEMINI_API_KEY=your_gemini_api_key_here
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5001
```

### 3. Start All Services
```bash
npm run dev
```

Or start individually:
```bash
npm run dev:backend      # Port 5000
npm run dev:aggregator   # Port 5001
npm run dev:predictor    # Port 5002
npm run dev:frontend     # Port 3000
```

---

## Features

### 🔐 Authentication
- JWT-based register/login
- Protected routes

### 📈 Live Prices
- Real-time prices via Binance WebSocket
- Redis caching for performance
- Supports BTC, ETH, BNB, SOL, ADA, DOGE, XRP, DOT

### 📊 Charts
- Candlestick-style price history
- Multiple timeframes (1m, 5m, 1h, 1d)

### 💰 Virtual Trading
- Buy/Sell crypto with virtual USD ($100,000 starting balance)
- Real-time portfolio value updates
- Trade history

### 🤖 AI Signals
- Gemini AI analyzes recent price trends
- Returns BUY / SELL / HOLD with confidence score and reasoning
- Refreshable on demand

### 💼 Portfolio
- Live P&L tracking
- Asset allocation breakdown
- Total portfolio value in USD

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`

### Market
- `GET /api/market/prices` — all current prices
- `GET /api/market/price/:symbol` — single coin price
- `GET /api/market/history/:symbol` — OHLC history

### Trading
- `POST /api/trades/buy`
- `POST /api/trades/sell`
- `GET  /api/trades/history`

### Portfolio
- `GET /api/portfolio` — full portfolio with P&L
- `GET /api/portfolio/balance` — USD balance

### AI
- `GET /api/ai/signal/:symbol` — Gemini AI signal for coin

---

## Docker

```bash
docker-compose up --build
```

This starts MongoDB, Redis, and all 3 Node services.

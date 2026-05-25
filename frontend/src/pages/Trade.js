import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bot, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketAPI, tradesAPI, aiAPI } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT'];
const INTERVALS = [
  { label: '1m', value: '1m', limit: 60 },
  { label: '5m', value: '5m', limit: 60 },
  { label: '1h', value: '1h', limit: 72 },
  { label: '4h', value: '4h', limit: 60 },
  { label: '1D', value: '1d', limit: 60 }
];

function SignalBadge({ signal }) {
  const config = {
    BUY: { color: 'var(--green)', bg: 'var(--green-dim)', icon: TrendingUp },
    SELL: { color: 'var(--red)', bg: 'var(--red-dim)', icon: TrendingDown },
    HOLD: { color: 'var(--yellow)', bg: 'rgba(255,211,42,0.15)', icon: Minus }
  };
  const c = config[signal] || config.HOLD;
  const Icon = c.icon;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 8, background: c.bg, color: c.color, fontWeight: 700, fontSize: 16 }}>
      <Icon size={18} />
      {signal}
    </div>
  );
}

export default function Trade() {
  const [searchParams] = useSearchParams();
  const [selectedCoin, setSelectedCoin] = useState(searchParams.get('symbol') || 'BTC');
  const [interval, setInterval] = useState('1h');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [aiSignal, setAiSignal] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { prices } = useWebSocket();
  const { user, updateBalance } = useAuth();

  const coinKey = selectedCoin.toLowerCase() + 'usdt';
  const currentPrice = prices[coinKey]?.price || 0;
  const change24h = prices[coinKey]?.change24h || 0;
  const total = quantity ? (parseFloat(quantity) * currentPrice).toFixed(2) : '0.00';

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const iv = INTERVALS.find(i => i.value === interval);
      const { data } = await marketAPI.getHistory(selectedCoin.toLowerCase(), interval, iv?.limit || 60);
      setHistory(data);
    } catch (e) {
      toast.error('Failed to load chart data');
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedCoin, interval]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const fetchAiSignal = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiAPI.getSignal(selectedCoin);
      setAiSignal(data);
    } catch (e) {
      toast.error('AI signal unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTrade = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return toast.error('Enter a valid quantity');
    setTradeLoading(true);
    try {
      let res;
      if (tradeType === 'BUY') {
        res = await tradesAPI.buy(selectedCoin, qty);
      } else {
        res = await tradesAPI.sell(selectedCoin, qty);
      }
      updateBalance(res.data.newBalance);
      toast.success(`${tradeType} ${qty} ${selectedCoin} @ $${currentPrice.toLocaleString()}`);
      setQuantity('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Trade failed');
    } finally {
      setTradeLoading(false);
    }
  };

  const chartColor = history.length > 1
    ? (history[history.length - 1]?.close >= history[0]?.open ? '#00d4aa' : '#ff4757')
    : '#00d4aa';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Trade</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Balance: <span className="mono" style={{ color: 'var(--accent)' }}>${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: Chart */}
        <div>
          {/* Coin selector + interval */}
          <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COINS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCoin(c)}
                    className="btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      background: selectedCoin === c ? 'var(--accent-dim)' : 'transparent',
                      color: selectedCoin === c ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${selectedCoin === c ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {INTERVALS.map(iv => (
                  <button
                    key={iv.value}
                    onClick={() => setInterval(iv.value)}
                    className="btn"
                    style={{
                      padding: '4px 10px',
                      fontSize: 11,
                      background: interval === iv.value ? 'var(--accent-dim)' : 'transparent',
                      color: interval === iv.value ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${interval === iv.value ? 'var(--accent)' : 'transparent'}`,
                    }}
                  >
                    {iv.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Mono' }}>
                  ${currentPrice >= 1000
                    ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : currentPrice.toFixed(4)}
                </div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: change24h >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 13, fontWeight: 600 }}>
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)
                  </span>
                  <span className="live-dot" />
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {selectedCoin}/USDT
              </div>
            </div>

            {historyLoading ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-spin" style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f44" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={t => format(new Date(t), interval === '1d' ? 'MMM dd' : 'HH:mm')}
                    tick={{ fontSize: 10, fill: '#4a6080' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(2)}
                    tick={{ fontSize: 10, fill: '#4a6080' }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0d1829', border: '1px solid #1e3a5f', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 12 }}
                    labelFormatter={t => format(new Date(t), 'MMM dd HH:mm')}
                    formatter={v => [`$${v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
                  />
                  <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill="url(#chartGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* AI Signal */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bot size={18} color="var(--accent)" />
                <span style={{ fontWeight: 700 }}>Gemini AI Signal</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{selectedCoin}/USDT</span>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={fetchAiSignal}
                disabled={aiLoading}
              >
                <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                {aiLoading ? 'Analyzing...' : 'Get Signal'}
              </button>
            </div>

            {!aiSignal ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Click "Get Signal" to analyze {selectedCoin} with Gemini AI
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <SignalBadge signal={aiSignal.signal} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence</div>
                    <div style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {aiSignal.confidence}%
                    </div>
                  </div>
                  {aiSignal.mock && (
                    <span className="badge badge-yellow" style={{ fontSize: 10 }}>MOCK</span>
                  )}
                </div>

                {/* Confidence bar */}
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginBottom: 16 }}>
                  <div style={{
                    height: '100%',
                    width: `${aiSignal.confidence}%`,
                    background: aiSignal.signal === 'BUY' ? 'var(--green)' : aiSignal.signal === 'SELL' ? 'var(--red)' : 'var(--yellow)',
                    borderRadius: 4,
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                  {aiSignal.reasoning}
                </p>

                {aiSignal.indicators && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {Object.entries(aiSignal.indicators).map(([key, val]) => (
                      <div key={key} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
                  Generated: {new Date(aiSignal.generatedAt).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Trade panel */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Place Order</h3>

            {/* Buy/Sell toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 20, background: 'var(--bg-secondary)', borderRadius: 8, padding: 4 }}>
              {['BUY', 'SELL'].map(t => (
                <button
                  key={t}
                  onClick={() => setTradeType(t)}
                  style={{
                    padding: '10px',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'Syne',
                    fontWeight: 700,
                    fontSize: 13,
                    transition: 'all 0.2s',
                    background: tradeType === t
                      ? (t === 'BUY' ? 'var(--green)' : 'var(--red)')
                      : 'transparent',
                    color: tradeType === t ? '#080b14' : 'var(--text-muted)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Price */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Market Price</label>
              <div className="input" style={{ color: 'var(--accent)' }}>
                ${currentPrice >= 1000
                  ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : currentPrice.toFixed(4)}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                Quantity ({selectedCoin})
              </label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="0"
                step="any"
              />
              {/* Quick % buttons */}
              {tradeType === 'BUY' && currentPrice > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 8 }}>
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      className="btn btn-outline"
                      style={{ padding: '4px', fontSize: 11 }}
                      onClick={() => setQuantity(((user.balance * pct / 100) / currentPrice).toFixed(6))}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{ marginBottom: 20, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Total Cost</span>
                <span>Available: ${(user?.balance || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 18, color: tradeType === 'BUY' ? 'var(--green)' : 'var(--red)' }}>
                ${parseFloat(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <button
              className={`btn ${tradeType === 'BUY' ? 'btn-primary' : 'btn-danger'}`}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={handleTrade}
              disabled={tradeLoading || !quantity || currentPrice === 0}
            >
              {tradeLoading ? 'Processing...' : `${tradeType} ${selectedCoin}`}
            </button>
          </div>

          {/* Market stats */}
          {prices[coinKey] && (
            <div className="card" style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>24h Stats</h4>
              {[
                { label: 'High', value: `$${prices[coinKey].high24h?.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
                { label: 'Low', value: `$${prices[coinKey].low24h?.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
                { label: 'Volume', value: `$${((prices[coinKey].quoteVolume || 0) / 1e9).toFixed(2)}B` },
                { label: 'Change', value: `${prices[coinKey].change24h >= 0 ? '+' : ''}${prices[coinKey].change24h?.toFixed(2)}%`, color: prices[coinKey].change24h >= 0 ? 'var(--green)' : 'var(--red)' }
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'Space Mono', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

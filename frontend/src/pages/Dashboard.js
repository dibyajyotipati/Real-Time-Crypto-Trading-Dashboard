import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { marketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', key: 'btcusdt', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', key: 'ethusdt', color: '#627eea' },
  { symbol: 'BNB', name: 'BNB', key: 'bnbusdt', color: '#f3ba2f' },
  { symbol: 'SOL', name: 'Solana', key: 'solusdt', color: '#9945ff' },
  { symbol: 'ADA', name: 'Cardano', key: 'adausdt', color: '#0033ad' },
  { symbol: 'DOGE', name: 'Dogecoin', key: 'dogeusdt', color: '#c2a633' },
  { symbol: 'XRP', name: 'XRP', key: 'xrpusdt', color: '#00aae4' },
  { symbol: 'DOT', name: 'Polkadot', key: 'dotusdt', color: '#e6007a' }
];

function PriceCard({ coin, priceData, onClick }) {
  const change = priceData?.change24h || 0;
  const price = priceData?.price || 0;
  const isPos = change >= 0;

  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderColor: 'var(--border)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = coin.color;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: coin.color + '22',
            border: `1px solid ${coin.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: coin.color
          }}>
            {coin.symbol.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{coin.symbol}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{coin.name}</div>
          </div>
        </div>
        <span className={`badge ${isPos ? 'badge-green' : 'badge-red'}`}>
          {isPos ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>

      <div style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700 }}>
        ${price >= 1000 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(4)}
      </div>

      <div style={{ marginTop: 6, display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Vol: ${((priceData?.quoteVolume || 0) / 1e9).toFixed(1)}B</span>
        <span style={{ color: isPos ? 'var(--green)' : 'var(--red)' }}>
          {isPos ? '▲' : '▼'} ${Math.abs(priceData?.changeAbs || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { prices, connected } = useWebSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState({});

  // Load chart history for featured coins
  useEffect(() => {
    ['BTC', 'ETH'].forEach(async sym => {
      try {
        const { data } = await marketAPI.getHistory(sym.toLowerCase(), '1h', 48);
        setHistory(prev => ({ ...prev, [sym]: data }));
      } catch (e) {}
    });
  }, []);

  const btcPrice = prices['btcusdt'];
  const ethPrice = prices['ethusdt'];

  const totalValue = COINS.reduce((sum, c) => {
    return sum + (prices[c.key]?.price || 0);
  }, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Market Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Live prices across {COINS.length} assets
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--bg-card)', borderRadius: 999, border: '1px solid var(--border)' }}>
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontFamily: 'Space Mono', color: connected ? 'var(--accent)' : 'var(--red)' }}>
            {connected ? 'LIVE' : 'RECONNECTING'}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Your Balance', value: `$${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'var(--accent)' },
          { label: 'BTC Price', value: btcPrice ? `$${btcPrice.price.toLocaleString()}` : '—', sub: btcPrice ? `${btcPrice.change24h >= 0 ? '+' : ''}${btcPrice.change24h?.toFixed(2)}% 24h` : '', icon: TrendingUp, color: '#f7931a' },
          { label: 'ETH Price', value: ethPrice ? `$${ethPrice.price.toLocaleString()}` : '—', sub: ethPrice ? `${ethPrice.change24h >= 0 ? '+' : ''}${ethPrice.change24h?.toFixed(2)}% 24h` : '', icon: Activity, color: '#627eea' }
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Space Mono', marginTop: 2 }}>{value}</div>
              {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Mini charts row */}
      {history['BTC'] && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
          {['BTC', 'ETH'].map(sym => {
            const h = history[sym];
            if (!h?.length) return null;
            const isPos = (h[h.length-1]?.close - h[0]?.open) >= 0;
            return (
              <div key={sym} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{sym}/USDT</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>48h chart</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 16 }}>
                      ${h[h.length-1]?.close?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={h} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`grad${sym}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPos ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPos ? '#00d4aa' : '#ff4757'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="close" stroke={isPos ? '#00d4aa' : '#ff4757'} strokeWidth={2} fill={`url(#grad${sym})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* All coins grid */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Markets</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {COINS.map(coin => (
          <PriceCard
            key={coin.key}
            coin={coin}
            priceData={prices[coin.key]}
            onClick={() => navigate(`/trade?symbol=${coin.symbol}`)}
          />
        ))}
      </div>
    </div>
  );
}

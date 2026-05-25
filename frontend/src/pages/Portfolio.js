import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Wallet, DollarSign } from 'lucide-react';
import { portfolioAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#00d4aa', '#627eea', '#f3ba2f', '#9945ff', '#0033ad', '#c2a633', '#00aae4', '#e6007a'];

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const { data } = await portfolioAPI.get();
      setPortfolio(data);
    } catch (e) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  const pieData = portfolio?.holdings?.map((h, i) => ({
    name: h.symbol,
    value: h.currentValue
  })).filter(d => d.value > 0) || [];

  const totalPnl = portfolio?.totalPnl || 0;
  const isProfit = totalPnl >= 0;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Your holdings & P&L</p>
        </div>
        <button className="btn btn-outline" onClick={fetchPortfolio} style={{ padding: '8px 14px' }}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Net Worth', value: `$${(portfolio?.netWorth || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet, color: 'var(--accent)' },
          { label: 'Cash Balance', value: `$${(portfolio?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#3d8bff' },
          { label: 'Holdings Value', value: `$${(portfolio?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: '#f3ba2f' },
          { label: 'Total P&L', value: `${isProfit ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: `${isProfit ? '+' : ''}${(portfolio?.totalPnlPercent || 0).toFixed(2)}%`, icon: isProfit ? TrendingUp : TrendingDown, color: isProfit ? 'var(--green)' : 'var(--red)' }
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Space Mono', color, marginTop: 2 }}>{value}</div>
              {sub && <div style={{ fontSize: 11, color, marginTop: 1 }}>{sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {portfolio?.holdings?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Wallet size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No holdings yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Go to Trade to buy your first crypto</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          {/* Holdings table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              Holdings
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Asset', 'Quantity', 'Avg Buy', 'Current', 'Value', 'P&L', 'P&L %'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h, i) => {
                    const pnlPos = h.pnl >= 0;
                    return (
                      <tr key={h.symbol} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS[i % COLORS.length] + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: COLORS[i % COLORS.length] }}>
                              {h.symbol.slice(0, 2)}
                            </div>
                            <span style={{ fontWeight: 700 }}>{h.symbol}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13 }}>{h.quantity.toFixed(6)}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13, color: 'var(--text-secondary)' }}>${h.avgBuyPrice.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13 }}>${h.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13, fontWeight: 700 }}>${h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13, color: pnlPos ? 'var(--green)' : 'var(--red)' }}>
                          {pnlPos ? '+' : ''}${h.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${pnlPos ? 'badge-green' : 'badge-red'}`}>
                            {pnlPos ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie chart */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Allocation</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1829', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12, fontFamily: 'Space Mono' }}
                  formatter={v => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 12 }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>
                    {((d.value / portfolio.totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

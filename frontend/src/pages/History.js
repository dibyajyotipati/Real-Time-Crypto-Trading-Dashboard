import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { tradesAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COINS = ['ALL', 'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT'];

export default function History() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('ALL');

  const fetchTrades = async (p = 1, sym = filter) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (sym !== 'ALL') params.symbol = sym;
      const { data } = await tradesAPI.getHistory(params);
      setTrades(data.trades);
      setTotalPages(data.pages);
      setTotal(data.total);
      setPage(p);
    } catch (e) {
      toast.error('Failed to load trade history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrades(1, filter); }, [filter]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Trade History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{total} total trades</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
          <Filter size={14} />
        </div>
        {COINS.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: filter === c ? 'var(--accent-dim)' : 'transparent',
              color: filter === c ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${filter === c ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div className="animate-spin" style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%' }} />
          </div>
        ) : trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <TrendingUp size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No trades found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Type', 'Asset', 'Quantity', 'Price', 'Total', 'Balance After', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => (
                    <tr
                      key={trade._id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', borderRadius: 6,
                          background: trade.type === 'BUY' ? 'var(--green-dim)' : 'var(--red-dim)',
                          color: trade.type === 'BUY' ? 'var(--green)' : 'var(--red)',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {trade.type === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {trade.type}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{trade.symbol}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13 }}>{trade.quantity.toFixed(6)}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13 }}>${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 13, fontWeight: 700 }}>${trade.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-secondary)' }}>${(trade.balanceAfter || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {format(new Date(trade.createdAt), 'MMM dd, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => fetchTrades(page - 1)} disabled={page === 1}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Space Mono' }}>
                  {page} / {totalPages}
                </span>
                <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => fetchTrades(page + 1)} disabled={page === totalPages}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

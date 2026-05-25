import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Briefcase, History, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/trade', icon: TrendingUp, label: 'Trade' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/history', icon: History, label: 'History' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: mobileOpen ? 0 : '-220px',
        bottom: 0,
        zIndex: 100,
        transition: 'left 0.3s',
        '@media (min-width: 768px)': { left: 0 }
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={18} color="#080b14" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CryptoTrade</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'Space Mono', letterSpacing: '0.1em' }}>SIMULATOR</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent'
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.username}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
              ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop sidebar spacer */}
      <div style={{ width: 220, flexShrink: 0, display: 'none' }} className="sidebar-spacer" />

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--accent)" />
            <span style={{ fontWeight: 800, fontSize: 15 }}>CryptoTrade</span>
          </div>
          <div style={{ fontSize: 12, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>
            ${user?.balance?.toFixed(0)}
          </div>
        </header>

        <div style={{ flex: 1, padding: '24px 20px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .sidebar { left: 0 !important; }
          .sidebar-spacer { display: block !important; }
          header { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// @ts-nocheck
import Link from 'next/link';
import React from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ title, children }) => {
  const shellStyle = {
    fontFamily: 'Inter, sans-serif',
    background: 'linear-gradient(180deg, #0f172a 0%, #0b1221 100%)',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '20px 16px 40px',
  };

  const cardStyle = {
    maxWidth: 1100,
    margin: '0 auto',
    background: '#0c1425',
    borderRadius: 14,
    border: '1px solid #1e293b',
    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
    overflow: 'hidden',
  };

  const navLinkStyle = {
    padding: '10px 14px',
    borderRadius: 10,
    color: '#e2e8f0',
    textDecoration: 'none',
    fontWeight: 600,
  };

  const activeStyle = { background: 'rgba(37, 99, 235, 0.15)', border: '1px solid #2563eb' };

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 22px',
            borderBottom: '1px solid #1e293b',
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.2 }}>Printer Agent</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{title || 'Keep printers online'}</div>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            <Link href="/" style={{ ...navLinkStyle, ...(pathname === '/' ? activeStyle : {}) }}>
              Dashboard
            </Link>
            <Link href="/printers" style={{ ...navLinkStyle, ...(pathname.includes('/printers') ? activeStyle : {}) }}>
              Printers
            </Link>
            {/* <Link href="/logs" style={{ ...navLinkStyle, ...(pathname.includes('/logs') ? activeStyle : {}) }}>
              Logs
            </Link> */}
          </nav>
        </header>
        <main style={{ padding: '22px', background: '#0c1425' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;

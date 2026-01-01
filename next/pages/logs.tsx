// @ts-nocheck
import React from 'react';
import Layout from '../components/Layout';

const mockLogs = [
  { id: '1', message: 'Printed receipt #1045', ts: '08:30' },
  { id: '2', message: 'Failover to Thermal Backup', ts: '08:12' },
  { id: '3', message: 'Websocket client connected', ts: '07:58' },
];

const LogsPage = () => (
  <Layout title="Logs">
    <div
      style={{
        background: '#0f172a',
        borderRadius: 14,
        border: '1px solid #1f2937',
        padding: 18,
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Recent events</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>Live feed of print jobs, failovers, and connectivity.</div>
        </div>
        <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>LIVE</span>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {mockLogs.map((log) => (
          <div
            key={log.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 10,
              background: 'linear-gradient(120deg, rgba(37,99,235,0.08), rgba(15,23,42,0.7))',
              border: '1px solid #1f2937',
            }}
          >
            <span>{log.message}</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{log.ts}</span>
          </div>
        ))}
      </div>
    </div>
  </Layout>
);

export default LogsPage;

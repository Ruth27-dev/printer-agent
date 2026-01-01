// @ts-nocheck
import React, { useState } from 'react';
import Layout from '../components/Layout';

const Stat = ({ label, value, tone = '#22c55e' }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, rgba(37,99,235,0.08), rgba(15,23,42,0.6))',
      padding: 16,
      borderRadius: 12,
      border: '1px solid #1f2937',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
    }}
  >
    <div style={{ fontSize: 12, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: tone }}>{value}</div>
  </div>
);

const HomePage = () => {
  const [updateState, setUpdateState] = useState({ checking: false, message: 'Tap check to see if an update is available.' });

  const checkUpdate = async () => {
    if (!window?.updateAPI?.check) {
      setUpdateState({ checking: false, message: 'Update check works in Electron build.' });
      return;
    }
    setUpdateState({ checking: true, message: 'Checking for updates...' });
    try {
      const result = await window.updateAPI.check();
      if (result.updateAvailable) {
        setUpdateState({
          checking: false,
          message: `Update ${result.latestVersion} available (current ${result.currentVersion}).`,
          downloadUrl: result.downloadUrl,
        });
      } else {
        setUpdateState({ checking: false, message: 'You are up to date.' });
      }
    } catch (error) {
      setUpdateState({ checking: false, message: `Update check failed: ${error.message}` });
    }
  };

  const runUpdate = async () => {
    if (!updateState.downloadUrl || !window?.updateAPI?.run) return;
    setUpdateState((prev) => ({ ...prev, checking: true, message: 'Downloading update...' }));
    try {
      await window.updateAPI.run(updateState.downloadUrl);
      setUpdateState({ checking: false, message: 'Installer launched. Follow the prompts to finish updating.' });
    } catch (error) {
      setUpdateState({ checking: false, message: `Download failed: ${error.message}` });
    }
  };

  return (
    <Layout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Stat label="Online printers" value="2" tone="#22c55e" />
        <Stat label="Queued jobs" value="0" tone="#facc15" />
        <Stat label="Failovers today" value="0" tone="#38bdf8" />
      </div>

      <div
        style={{
          marginTop: 24,
          background: '#0f172a',
          borderRadius: 14,
          border: '1px solid #1f2937',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(56,189,248,0.15)',
            display: 'grid',
            placeItems: 'center',
            color: '#38bdf8',
            fontWeight: 800,
          }}
        >
          i
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>Activity</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            Recent print jobs will appear here once the websocket server is broadcasting.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          border: '1px dashed #334155',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>Quick tips</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            Run the Electron app with your printers powered on, then open the Printers tab to check status.
          </div>
        </div>
        <a
          href="/printers"
          style={{
            background: '#2563eb',
            color: '#e2e8f0',
            border: '1px solid #1d4ed8',
            padding: '10px 14px',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Go to printers
        </a>
      </div>

      <div
        style={{
          marginTop: 16,
          background: '#0f172a',
          borderRadius: 12,
          border: '1px solid #1f2937',
          padding: 14,
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>Update</div>
        <div style={{ color: '#cbd5e1', fontSize: 13 }}>{updateState.message}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={checkUpdate}
            disabled={updateState.checking}
            style={{
              background: '#2563eb',
              color: '#e2e8f0',
              border: '1px solid #1d4ed8',
              padding: '10px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              opacity: updateState.checking ? 0.7 : 1,
            }}
          >
            {updateState.checking ? 'Checking...' : 'Check for updates'}
          </button>
          {updateState.downloadUrl && (
            <button
              type="button"
              onClick={runUpdate}
              style={{
                background: '#22c55e',
                color: '#0f172a',
                border: '1px solid #16a34a',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Download & install
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;

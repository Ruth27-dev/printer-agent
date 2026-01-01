// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PrinterList from '../components/PrinterList';
import { useRouter } from 'next/router';

const PrintersPage = () => {
  const router = useRouter();
  const [data, setData] = useState({ printers: [], defaultPrinter: undefined });
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    let interval;
    const loadPrinters = async () => {
      try {
        if (window?.printerAPI) {
          const payload = await window.printerAPI.listPrinters();
          if (mounted) {
            const stored = JSON.parse(localStorage.getItem('customPrinters') || '[]');
            setData({
              ...payload,
              printers: [...payload.printers, ...stored],
            });
          }
        } else {
          const stored = JSON.parse(localStorage.getItem('customPrinters') || '[]');
          setData({
            printers: [
              { id: 'thermal-1', name: 'Thermal Receipt (USB)', type: 'escpos' },
              { id: 'thermal-backup', name: 'Thermal Backup', type: 'escpos' },
              ...stored,
            ],
            defaultPrinter: 'thermal-1',
          });
        }
      } catch (error) {
        console.error('Failed to load printers', error);
      }
    };

    loadPrinters();
    // Auto-refresh printers periodically when running inside Electron.
    if (window?.printerAPI) {
      interval = setInterval(loadPrinters, 5000);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this printer?')) return;
    // Remove locally stored custom printers so UI stays in sync.
    const stored = JSON.parse(localStorage.getItem('customPrinters') || '[]').filter((p) => p.id !== id);
    localStorage.setItem('customPrinters', JSON.stringify(stored));

    // Attempt to delete backend printer if available.
    if (window?.printerAPI) {
      try {
        await window.printerAPI.deletePrinter(id);
      } catch (error) {
        console.error('Failed to delete printer in backend', error);
      }
    }

    setData((prev) => ({
      ...prev,
      printers: prev.printers.filter((p) => p.id !== id),
      defaultPrinter: prev.defaultPrinter === id ? stored[0]?.id : prev.defaultPrinter,
    }));
  };

  const handleCheckStatus = async (id) => {
    setStatusMessage('Checking printer...');
    try {
      if (!window?.printerAPI?.checkStatus) {
        setStatusMessage('Status check only works in Electron build.');
        return;
      }
      const result = await window.printerAPI.checkStatus(id);
      if (result.ok) {
        setStatusMessage(`Printer ${id} is connected.`);
      } else {
        setStatusMessage(`Printer ${id} error: ${result.error || 'Unavailable'}`);
      }
    } catch (error) {
      console.error('Status check failed', error);
      setStatusMessage(`Printer ${id} error: ${error.message}`);
    }
  };

  return (
    <Layout title="Printers">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 19 }}>Printers</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            Manage devices, run a quick status check, and add backup printers.
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/printers/new')}
          style={{
            background: '#22c55e',
            color: '#0f172a',
            border: '1px solid #16a34a',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 6px 12px rgba(22,163,74,0.25)',
          }}
        >
          + Add printer
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #1d4ed8',
            background: 'rgba(37,99,235,0.08)',
            color: '#dbeafe',
          }}
        >
          {statusMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <PrinterList
            printers={data.printers}
            defaultPrinter={data.defaultPrinter}
            onDelete={handleDelete}
            onCheckStatus={handleCheckStatus}
          />
        </div>
        <div
          style={{
            background: '#0f172a',
            borderRadius: 12,
            border: '1px solid #1f2937',
            padding: 14,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 700 }}>Connection tips</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>1) Plug in printer and wait 5 seconds.</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>2) Hit “Check” to verify connectivity.</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>3) Set a default and add a backup for failover.</div>
        </div>
      </div>
    </Layout>
  );
};

export default PrintersPage;

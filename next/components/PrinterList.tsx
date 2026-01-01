// @ts-nocheck
import React from 'react';

type Printer = {
  id: string;
  name: string;
  type: string;
};

type Props = {
  printers: Printer[];
  defaultPrinter?: string;
  onDelete?: (id: string) => void;
  onCheckStatus?: (id: string) => void;
};

const PrinterList: React.FC<Props> = ({ printers, defaultPrinter, onDelete, onCheckStatus }) => (
  <div style={{ display: 'grid', gap: 12 }}>
    {printers.map((printer) => (
      <div key={printer.id} style={{ border: '1px solid #1e293b', borderRadius: 10, padding: 14, background: '#111827' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{printer.name}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>{printer.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {defaultPrinter === printer.id && (
              <span style={{ fontSize: 12, color: '#10b981' }}>Default</span>
            )}
            {onCheckStatus && (
              <button
                type="button"
                onClick={() => onCheckStatus(printer.id)}
                style={{
                  background: 'transparent',
                  color: '#38bdf8',
                  border: '1px solid #0ea5e9',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Check
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(printer.id)}
                style={{
                  background: 'transparent',
                  color: '#f87171',
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          <span
            style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid #3b82f6',
              color: '#dbeafe',
              padding: '3px 8px',
              borderRadius: 999,
            }}
          >
            {printer.type}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default PrinterList;

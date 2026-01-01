// @ts-nocheck
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const NewPrinterPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    id: '',
    type: 'escpos',
    host: '',
    port: 9100,
    vendorId: '',
    productId: '',
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const id = form.id || form.name.toLowerCase().replace(/\s+/g, '-');
    if (!id || !form.name) {
      alert('Name is required');
      return;
    }

    const printer = { id, name: form.name, type: form.type };
    const stored = JSON.parse(localStorage.getItem('customPrinters') || '[]');
    localStorage.setItem('customPrinters', JSON.stringify([...stored, printer]));
    router.push('/printers');
  };

  return (
    <Layout title="Add Printer">
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#111827', padding: 20, borderRadius: 12, border: '1px solid #1f2937' }}>
        <h2 style={{ marginBottom: 12, fontSize: 18 }}>Create new printer</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Name</span>
            <input
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Kitchen printer"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #1f2937', background: '#0b1221', color: '#e2e8f0' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>ID (optional)</span>
            <input
              value={form.id}
              onChange={handleChange('id')}
              placeholder="kitchen-printer"
              style={{ padding: 10, borderRadius: 8, border: '1px solid #1f2937', background: '#0b1221', color: '#e2e8f0' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Type</span>
            <select
              value={form.type}
              onChange={handleChange('type')}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #1f2937', background: '#0b1221', color: '#e2e8f0' }}
            >
              <option value="escpos">ESC/POS</option>
              <option value="network">Network</option>
              <option value="usb">USB</option>
              <option value="serial">Serial</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              style={{ flex: 1, background: '#2563eb', color: '#e2e8f0', border: '1px solid #1d4ed8', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => router.push('/printers')}
              style={{ flex: 1, background: 'transparent', color: '#e2e8f0', border: '1px solid #1f2937', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewPrinterPage;

import { useEffect, useState } from 'react';
import { getInventory, createInventoryItem, adjustStock, getQrCode } from '../api/wmsApi';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null); // 'create' | 'adjust' | 'qr'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', quantity: 1 });
  const [adjustForm, setAdjustForm] = useState({ itemId: '', delta: 0 });
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => getInventory().then(r => setItems(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openAdjust = (item) => {
    setSelected(item);
    setAdjustForm({ itemId: item.id, delta: 0 });
    setError('');
    setModal('adjust');
  };

  const openQr = async (item) => {
    setSelected(item);
    setModal('qr');
    try {
      const r = await getQrCode(item.sku);
      setQrData(r.data);
    } catch { setQrData(''); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createInventoryItem({ ...form, quantity: Number(form.quantity) });
      setForm({ sku: '', name: '', quantity: 1 });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item.');
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adjustStock({ itemId: adjustForm.itemId, delta: Number(adjustForm.delta) });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Adjustment failed.');
    }
  };

  const closeModal = () => { setModal(null); setError(''); setQrData(''); };

  const filtered = items.filter(i =>
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Track and manage all SKUs across bins</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: '0.88rem', width: 220 }}
            placeholder="Search SKU or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => { setError(''); setModal('create'); }}>+ Add Item</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Qty</th><th>Bin</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} className="empty">No items found.</td></tr>
                : filtered.map(item => (
                  <tr key={item.id}>
                    <td><code>{item.sku}</code></td>
                    <td>{item.name}</td>
                    <td><strong>{item.quantity}</strong></td>
                    <td>{item.binLabel || <span style={{ color: '#aaa' }}>Unassigned</span>}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => openAdjust(item)}>Adjust</button>
                      <button className="btn btn-sm" style={{ background: '#f0f2f5' }} onClick={() => openQr(item)}>QR</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Inventory Item</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="form-grid">
              <div className="form-group">
                <label>SKU *</label>
                <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-001" />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Widget A" />
              </div>
              <div className="form-group">
                <label>Initial Quantity *</label>
                <input type="number" min="1" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary">Create Item</button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {modal === 'adjust' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Stock — {selected.sku}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>
              Current quantity: <strong>{selected.quantity}</strong>. Enter a positive value to add stock or negative to remove.
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAdjust} className="form-grid">
              <div className="form-group">
                <label>Delta (e.g. +10 or -5)</label>
                <input type="number" required value={adjustForm.delta} onChange={e => setAdjustForm({ ...adjustForm, delta: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary">Apply Adjustment</button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {modal === 'qr' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>QR Code — {selected.sku}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {qrData
              ? <img src={qrData} alt="QR Code" className="qr-img" />
              : <p className="empty">Generating QR code…</p>}
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
              Scan to identify: <code>SKU:{selected.sku}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

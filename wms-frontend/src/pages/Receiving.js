import { useEffect, useState } from 'react';
import { getShipments, receiveShipment } from '../api/wmsApi';
import StatusBadge from '../components/StatusBadge';

export default function Receiving() {
  const [shipments, setShipments] = useState([]);
  const [modal, setModal] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ referenceNumber: '', supplier: '', lines: [{ sku: '', itemName: '', quantity: 1 }] });
  const [error, setError] = useState('');

  const load = () => getShipments().then(r => setShipments(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { sku: '', itemName: '', quantity: 1 }] }));
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i, field, val) => setForm(f => {
    const lines = [...f.lines];
    lines[i] = { ...lines[i], [field]: val };
    return { ...f, lines };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        referenceNumber: form.referenceNumber,
        supplier: form.supplier,
        lines: form.lines.map(l => ({ ...l, quantity: Number(l.quantity) }))
      };
      const r = await receiveShipment(payload);
      setResult(r.data);
      setForm({ referenceNumber: '', supplier: '', lines: [{ sku: '', itemName: '', quantity: 1 }] });
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to receive shipment.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Receiving & Putaway</h1>
        <p>Log inbound shipments and auto-assign storage bins</p>
      </div>

      {result && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid #28a745' }}>
          <div className="section-title" style={{ color: '#155724' }}>✅ Putaway Complete — {result.referenceNumber}</div>
          <table style={{ marginTop: 10 }}>
            <thead>
              <tr><th>SKU</th><th>Qty</th><th>Assigned Bin</th></tr>
            </thead>
            <tbody>
              {result.putawayResults?.map((p, i) => (
                <tr key={i}>
                  <td><code>{p.sku}</code></td>
                  <td>{p.quantity}</td>
                  <td><strong>{p.assignedBin}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-sm" style={{ background: '#f0f2f5', marginTop: 12 }} onClick={() => setResult(null)}>Dismiss</button>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <span className="section-title" style={{ margin: 0 }}>Shipment History</span>
          <button className="btn btn-primary" onClick={() => { setError(''); setModal(true); }}>+ Receive Shipment</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Reference #</th><th>Supplier</th><th>Status</th><th>Received At</th></tr>
            </thead>
            <tbody>
              {shipments.length === 0
                ? <tr><td colSpan={4} className="empty">No shipments recorded.</td></tr>
                : shipments.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.referenceNumber}</strong></td>
                    <td>{s.supplier || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{new Date(s.receivedAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Receive Inbound Shipment</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Reference # *</label>
                  <input required value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} placeholder="e.g. SHP-2024-001" />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Acme Corp" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Shipment Lines</label>
                <div className="lines-list">
                  {form.lines.map((line, i) => (
                    <div key={i} className="line-row">
                      <div className="form-group">
                        <label>SKU</label>
                        <input required value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)} placeholder="SKU-001" />
                      </div>
                      <div className="form-group">
                        <label>Item Name</label>
                        <input required value={line.itemName} onChange={e => updateLine(i, 'itemName', e.target.value)} placeholder="Widget A" />
                      </div>
                      <div className="form-group">
                        <label>Qty</label>
                        <input type="number" min="1" required value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        {form.lines.length > 1 && (
                          <button type="button" className="btn-remove" onClick={() => removeLine(i)}>✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn" style={{ background: '#f0f2f5', fontSize: '0.82rem' }} onClick={addLine}>+ Add Line</button>
              </div>

              <button type="submit" className="btn btn-primary">Process & Putaway</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

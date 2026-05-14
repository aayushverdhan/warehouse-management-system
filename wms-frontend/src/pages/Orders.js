import { useEffect, useState } from 'react';
import { getOrders, createOrder, advanceOrder, getInventory } from '../api/wmsApi';
import StatusBadge from '../components/StatusBadge';

const NEXT_STATUS = { PENDING: 'PICKING', PICKING: 'PACKED', PACKED: 'SHIPPED' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ orderNumber: '', lines: [{ itemId: '', quantity: 1 }] });
  const [error, setError] = useState('');

  const load = () => getOrders().then(r => setOrders(r.data)).catch(() => {});

  useEffect(() => {
    load();
    getInventory().then(r => setItems(r.data)).catch(() => {});
  }, []);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { itemId: '', quantity: 1 }] }));
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i, field, val) => setForm(f => {
    const lines = [...f.lines];
    lines[i] = { ...lines[i], [field]: val };
    return { ...f, lines };
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        orderNumber: form.orderNumber,
        lines: form.lines.map(l => ({ itemId: Number(l.itemId), quantity: Number(l.quantity) }))
      };
      await createOrder(payload);
      setForm({ orderNumber: '', lines: [{ itemId: '', quantity: 1 }] });
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order.');
    }
  };

  const handleAdvance = async (id) => {
    try {
      await advanceOrder(id);
      load();
      if (detail?.id === id) {
        const updated = orders.find(o => o.id === id);
        if (updated) setDetail({ ...updated, status: NEXT_STATUS[updated.status] });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot advance order.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage order fulfillment lifecycle</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="section-title" style={{ margin: 0 }}>All Orders</span>
          <button className="btn btn-primary" onClick={() => { setError(''); setModal(true); }}>+ New Order</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order #</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={4} className="empty">No orders yet.</td></tr>
                : orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm" style={{ background: '#f0f2f5' }} onClick={() => setDetail(o)}>View</button>
                      {NEXT_STATUS[o.status] && (
                        <button className="btn btn-sm btn-success" onClick={() => handleAdvance(o.id)}>
                          → {NEXT_STATUS[o.status]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Order</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="form-grid">
              <div className="form-group">
                <label>Order Number *</label>
                <input required value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} placeholder="e.g. ORD-2024-001" />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Order Lines</label>
                <div className="lines-list">
                  {form.lines.map((line, i) => (
                    <div key={i} className="line-row">
                      <div className="form-group">
                        <label>Item</label>
                        <select required value={line.itemId} onChange={e => updateLine(i, 'itemId', e.target.value)}>
                          <option value="">Select…</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>{item.sku} — {item.name} (qty: {item.quantity})</option>
                          ))}
                        </select>
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
              <button type="submit" className="btn btn-primary">Create Order</button>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order — {detail.orderNumber}</h2>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <p style={{ marginBottom: 12, fontSize: '0.88rem' }}>
              Status: <StatusBadge status={detail.status} />
            </p>
            <table>
              <thead>
                <tr><th>SKU</th><th>Item</th><th>Qty</th><th>Bin</th></tr>
              </thead>
              <tbody>
                {detail.lines?.map((l, i) => (
                  <tr key={i}>
                    <td><code>{l.sku}</code></td>
                    <td>{l.itemName}</td>
                    <td>{l.quantity}</td>
                    <td>{l.binLabel || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {NEXT_STATUS[detail.status] && (
              <button
                className="btn btn-success"
                style={{ marginTop: 16 }}
                onClick={() => { handleAdvance(detail.id); setDetail(null); }}
              >
                Advance to {NEXT_STATUS[detail.status]}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getWarehouses, createWarehouse } from '../api/wmsApi';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });
  const [error, setError] = useState('');

  const load = () => getWarehouses().then(r => setWarehouses(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createWarehouse(form);
      setForm({ name: '', location: '' });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create warehouse.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Warehouses</h1>
        <p>Manage your warehouse locations</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <span className="section-title" style={{ margin: 0 }}>All Warehouses</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Warehouse</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Location</th></tr>
            </thead>
            <tbody>
              {warehouses.length === 0
                ? <tr><td colSpan={3} className="empty">No warehouses found.</td></tr>
                : warehouses.map(w => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{w.name}</td>
                    <td>{w.location || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Warehouse</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. East Wing" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Chicago, IL" />
              </div>
              <button type="submit" className="btn btn-primary">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

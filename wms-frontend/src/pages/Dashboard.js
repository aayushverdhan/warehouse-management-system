import { useEffect, useState } from 'react';
import { getDashboard } from '../api/wmsApi';

const STATS = [
  { key: 'totalWarehouses', label: 'Warehouses', icon: '🏭' },
  { key: 'totalItems',      label: 'SKUs',        icon: '📦' },
  { key: 'totalOrders',     label: 'Total Orders', icon: '🛒' },
  { key: 'pendingOrders',   label: 'Pending',      icon: '⏳' },
  { key: 'shippedOrders',   label: 'Shipped',      icon: '✅' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard stats.'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time warehouse operations overview</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        {STATS.map(({ key, label, icon }) => (
          <div className="stat-card" key={key}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{stats ? stats[key] : '—'}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">System Status</div>
        <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.7 }}>
          The WMS is operational. Use the sidebar to manage warehouses, track inventory,
          process inbound shipments, and fulfill customer orders. All inventory transactions
          are ACID-compliant with pessimistic locking to prevent race conditions.
        </p>
      </div>
    </div>
  );
}

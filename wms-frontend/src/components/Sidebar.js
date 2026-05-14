import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/warehouses', label: 'Warehouses', icon: '🏭' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/orders', label: 'Orders', icon: '🛒' },
  { to: '/receiving', label: 'Shipments', icon: '🚚' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">WMS <span>Pro</span></div>
      <nav>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

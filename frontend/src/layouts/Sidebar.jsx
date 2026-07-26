import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Users, UserCog } from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/usuarios', label: 'Usuarios', icon: UserCog },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Casa de Materiales</div>
      <nav className="sidebar-nav">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
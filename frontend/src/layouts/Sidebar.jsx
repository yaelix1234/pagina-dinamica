import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ClipboardList, Users, UserCog, LogOut } from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Tag },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/usuarios', label: 'Usuarios', icon: UserCog },
];

function Sidebar({ abierto, onCerrar }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${abierto ? 'sidebar-abierto' : ''}`}>
      <div className="sidebar-logo">Casa de Materiales</div>
      <nav className="sidebar-nav">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onCerrar}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {usuario && <div className="sidebar-usuario">{usuario.nombre}</div>}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
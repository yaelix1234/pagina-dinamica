import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import './MainLayout.css';

function MainLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="main-layout">
      <button
        className="btn-menu-movil"
        onClick={() => setSidebarAbierto(!sidebarAbierto)}
      >
        <Menu size={22} />
      </button>

      <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />

      {sidebarAbierto && (
        <div className="sidebar-overlay" onClick={() => setSidebarAbierto(false)} />
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
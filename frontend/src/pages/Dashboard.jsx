import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('dashboard/resumen/')
      .then((res) => setResumen(res.data))
      .catch(() => setError('No se pudo cargar el resumen del dashboard.'));
  }, []);

  if (error) return <p className="error-msg">{error}</p>;
  if (!resumen) return <p>Cargando resumen...</p>;

  return (
    <div>
      <h1>Resumen</h1>
      <div className="cards-grid">
        <div className="card">
          <span className="card-label">Ingresos del mes</span>
          <span className="card-value">${resumen.ingresos_mes}</span>
        </div>
        <div className="card">
          <span className="card-label">Pedidos hoy</span>
          <span className="card-value">{resumen.pedidos_hoy}</span>
        </div>
        <div className="card">
          <span className="card-label">Total clientes</span>
          <span className="card-value">{resumen.total_clientes}</span>
        </div>
        <div className="card">
          <span className="card-label">Inventario bajo</span>
          <span className="card-value">{resumen.productos_inventario_bajo}</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
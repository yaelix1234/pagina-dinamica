import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../api/axiosConfig';

function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [ventas7Dias, setVentas7Dias] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [inventarioBajo, setInventarioBajo] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('dashboard/resumen/'),
      api.get('dashboard/ventas-7-dias/'),
      api.get('dashboard/productos-mas-vendidos/'),
      api.get('dashboard/productos-recientes/'),
      api.get('dashboard/inventario-bajo/'),
    ])
      .then(([resResumen, resVentas, resMasVendidos, resRecientes, resInventario]) => {
        setResumen(resResumen.data);
        setVentas7Dias(
          resVentas.data.map((v) => ({
            fecha: new Date(v.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
            total: Number(v.total),
          }))
        );
        setMasVendidos(resMasVendidos.data);
        setRecientes(resRecientes.data);
        setInventarioBajo(resInventario.data);
      })
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

      <div className="panel">
        <h2>Ventas de los últimos 7 días</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={ventas7Dias}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h2>Productos más vendidos</h2>
          {masVendidos.length === 0 ? (
            <p className="texto-vacio">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="lista-simple">
              {masVendidos.map((p) => (
                <li key={p.producto_id}>
                  <span>{p.nombre}</span>
                  <span className="badge">{p.cantidad_vendida} vendidos</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h2>Productos recientes</h2>
          {recientes.length === 0 ? (
            <p className="texto-vacio">No hay productos registrados todavía.</p>
          ) : (
            <ul className="lista-simple">
              {recientes.map((p) => (
                <li key={p.id}>
                  <span>{p.nombre}</span>
                  <span className="badge badge-gris">{p.categoria_nombre}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h2>Inventario por atender</h2>
          {inventarioBajo.length === 0 ? (
            <p className="texto-vacio">Todo el inventario está en buen nivel.</p>
          ) : (
            <ul className="lista-simple">
              {inventarioBajo.map((p) => (
                <li key={p.id}>
                  <span>{p.nombre}</span>
                  <span className="badge badge-alerta">{p.existencias} unidades</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
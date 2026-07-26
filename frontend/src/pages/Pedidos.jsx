import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('pedidos/')
      .then((res) => setPedidos(res.data.results))
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando pedidos...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div>
      <h1>Pedidos</h1>
      {pedidos.length === 0 ? (
        <p>No hay pedidos registrados todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Unidades</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.cliente_nombre}</td>
                <td>{p.numero_total_unidades}</td>
                <td>${p.total}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Pedidos;
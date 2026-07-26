import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('clientes/')
      .then((res) => setClientes(res.data.results))
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando clientes...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div>
      <h1>Clientes</h1>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Pedidos</th>
              <th>Total gastado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre_completo}</td>
                <td>{c.telefono}</td>
                <td>{c.correo}</td>
                <td>{c.numero_pedidos}</td>
                <td>${c.dinero_total_gastado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Clientes;
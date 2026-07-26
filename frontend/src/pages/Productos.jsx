import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('productos/')
      .then((res) => setProductos(res.data.results))
      .catch((err) => setError('No se pudieron cargar los productos. ¿Iniciaste sesión en el admin de Django?'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando productos...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div>
      <h1>Productos</h1>
      {productos.length === 0 ? (
        <p>No hay productos registrados todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Existencias</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria_nombre}</td>
                <td>${p.precio}</td>
                <td>{p.existencias}</td>
                <td>{p.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Productos;
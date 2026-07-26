import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('usuarios/')
      .then((res) => setUsuarios(res.data.results))
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando usuarios...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div>
      <h1>Usuarios</h1>
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Cargo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.cargo}</td>
                <td>{u.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Usuarios;
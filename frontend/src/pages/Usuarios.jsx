import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import UsuarioForm from '../components/UsuarioForm';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);

  const cargarDatos = () => {
    setCargando(true);
    api.get('usuarios/')
      .then((res) => {
        setUsuarios(res.data.results);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setUsuarioEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      await api.delete(`usuarios/${id}/`);
      cargarDatos();
    } catch {
      alert('No se pudo eliminar el usuario.');
    }
  };

  const handleGuardado = () => {
    setMostrarForm(false);
    cargarDatos();
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Usuarios</h1>
        <button className="btn-primario" onClick={handleNuevo}>
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {usuarios.length === 0 && !error ? (
        <p>No hay usuarios registrados todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.cargo === 'administrador' ? 'Administrador' : 'Empleado'}</td>
                <td>{u.estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
                <td className="acciones">
                  <button className="btn-icono" onClick={() => handleEditar(u)}>
                    <Pencil size={16} />
                  </button>
                  <button className="btn-icono btn-eliminar" onClick={() => handleEliminar(u.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarForm && (
        <UsuarioForm
          usuarioEditar={usuarioEditar}
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Usuarios;
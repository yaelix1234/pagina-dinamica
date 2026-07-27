import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import CategoriaForm from '../components/CategoriaForm';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);

  const cargarDatos = () => {
    setCargando(true);
    api.get('categorias/')
      .then((res) => {
        setCategorias(res.data.results);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setCategoriaEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (categoria) => {
    setCategoriaEditar(categoria);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    try {
      await api.delete(`categorias/${id}/`);
      cargarDatos();
    } catch {
      alert('No se pudo eliminar la categoría. Puede que tenga productos asociados.');
    }
  };

  const handleGuardado = () => {
    setMostrarForm(false);
    cargarDatos();
  };

  if (cargando) return <p>Cargando categorías...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Categorías</h1>
        <button className="btn-primario" onClick={handleNuevo}>
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {categorias.length === 0 && !error ? (
        <p>No hay categorías registradas todavía.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.descripcion}</td>
                <td className="acciones">
                  <button className="btn-icono" onClick={() => handleEditar(c)}>
                    <Pencil size={16} />
                  </button>
                  <button className="btn-icono btn-eliminar" onClick={() => handleEliminar(c.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarForm && (
        <CategoriaForm
          categoriaEditar={categoriaEditar}
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Categorias;
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import ProductoForm from '../components/ProductoForm';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      api.get('productos/'),
      api.get('categorias/'),
    ])
      .then(([resProductos, resCategorias]) => {
        setProductos(resProductos.data.results);
        setCategorias(resCategorias.data.results);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setProductoEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (producto) => {
    setProductoEditar(producto);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await api.delete(`productos/${id}/`);
      cargarDatos();
    } catch {
      alert('No se pudo eliminar el producto.');
    }
  };

  const handleGuardado = () => {
    setMostrarForm(false);
    cargarDatos();
  };

  if (cargando) return <p>Cargando productos...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn-primario" onClick={handleNuevo}>
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {productos.length === 0 && !error ? (
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria_nombre}</td>
                <td>${p.precio}</td>
                <td>{p.existencias}</td>
                <td>{p.estado === 'disponible' ? 'Disponible' : 'No disponible'}</td>
                <td className="acciones">
                  <button className="btn-icono" onClick={() => handleEditar(p)}>
                    <Pencil size={16} />
                  </button>
                  <button className="btn-icono btn-eliminar" onClick={() => handleEliminar(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarForm && (
        <ProductoForm
          productoEditar={productoEditar}
          categorias={categorias}
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Productos;
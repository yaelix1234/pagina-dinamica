import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import PedidoForm from '../components/PedidoForm';

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'listo', label: 'Listos' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
];

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pedidoEditar, setPedidoEditar] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      api.get('pedidos/'),
      api.get('clientes/'),
      api.get('productos/'),
    ])
      .then(([resPedidos, resClientes, resProductos]) => {
        setPedidos(resPedidos.data.results);
        setClientes(resClientes.data.results);
        setProductos(resProductos.data.results);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setPedidoEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (pedido) => {
    setPedidoEditar(pedido);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este pedido?')) return;
    try {
      await api.delete(`pedidos/${id}/`);
      cargarDatos();
    } catch {
      alert('No se pudo eliminar el pedido.');
    }
  };

  const handleCambiarEstado = async (pedido, nuevoEstado) => {
    try {
      await api.patch(`pedidos/${pedido.id}/`, { estado: nuevoEstado });
      cargarDatos();
    } catch {
      alert('No se pudo actualizar el estado.');
    }
  };

  const handleGuardado = () => {
    setMostrarForm(false);
    cargarDatos();
  };

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter((p) => p.estado === filtroEstado);

  if (cargando) return <p>Cargando pedidos...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Pedidos</h1>
        <button className="btn-primario" onClick={handleNuevo}>
          <Plus size={18} /> Nuevo pedido
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="filtros-estado">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            className={`filtro-btn ${filtroEstado === e.value ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(e.value)}
          >
            {e.label}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 && !error ? (
        <p>No hay pedidos con este filtro.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Unidades</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.cliente_nombre}</td>
                <td>{p.numero_total_unidades}</td>
                <td>${p.total}</td>
                <td>
                  <select
                    value={p.estado}
                    onChange={(e) => handleCambiarEstado(p, e.target.value)}
                    className="select-estado"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_preparacion">En preparación</option>
                    <option value="listo">Listo</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
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
        <PedidoForm
          pedidoEditar={pedidoEditar}
          clientes={clientes}
          productos={productos}
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Pedidos;
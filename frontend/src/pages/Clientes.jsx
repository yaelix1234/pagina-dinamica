import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import ClienteForm from '../components/ClienteForm';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);

  const cargarDatos = () => {
    setCargando(true);
    api.get('clientes/')
      .then((res) => {
        setClientes(res.data.results);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevo = () => {
    setClienteEditar(null);
    setMostrarForm(true);
  };

  const handleEditar = (cliente) => {
    setClienteEditar(cliente);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await api.delete(`clientes/${id}/`);
      cargarDatos();
    } catch {
      alert('No se pudo eliminar el cliente.');
    }
  };

  const handleGuardado = () => {
    setMostrarForm(false);
    cargarDatos();
  };

  if (cargando) return <p>Cargando clientes...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn-primario" onClick={handleNuevo}>
          <Plus size={18} /> Nuevo cliente
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {clientes.length === 0 && !error ? (
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
              <th>Acciones</th>
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
        <ClienteForm
          clienteEditar={clienteEditar}
          onGuardado={handleGuardado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Clientes;
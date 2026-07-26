import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import api from '../api/axiosConfig';

function PedidoForm({ pedidoEditar, clientes, productos, onGuardado, onCancelar }) {
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState([{ producto: '', cantidad: 1 }]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (pedidoEditar) {
      setCliente(pedidoEditar.cliente);
      setMetodoPago(pedidoEditar.metodo_pago);
      setNotas(pedidoEditar.notas || '');
      setDetalles(
        pedidoEditar.detalles.map((d) => ({ producto: d.producto, cantidad: d.cantidad }))
      );
    }
  }, [pedidoEditar]);

  const agregarProducto = () => {
    setDetalles([...detalles, { producto: '', cantidad: 1 }]);
  };

  const quitarProducto = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;
    setDetalles(nuevos);
  };

  const calcularTotalEstimado = () => {
    return detalles.reduce((total, d) => {
      const producto = productos.find((p) => p.id === Number(d.producto));
      if (!producto) return total;
      return total + producto.precio * Number(d.cantidad || 0);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cliente) {
      setError('Selecciona un cliente.');
      return;
    }
    if (detalles.some((d) => !d.producto || !d.cantidad)) {
      setError('Completa todos los productos y cantidades.');
      return;
    }

    setGuardando(true);

    const payload = {
      cliente,
      metodo_pago: metodoPago,
      notas,
      detalles: detalles.map((d) => ({
        producto: Number(d.producto),
        cantidad: Number(d.cantidad),
      })),
    };

    try {
      if (pedidoEditar) {
        await api.put(`pedidos/${pedidoEditar.id}/`, payload);
      } else {
        await api.post('pedidos/', payload);
      }
      onGuardado();
    } catch (err) {
      const datosError = err.response?.data;
      let mensaje = 'No se pudo guardar el pedido. Revisa los campos.';

      if (datosError?.detalles && Array.isArray(datosError.detalles)) {
        mensaje = datosError.detalles[0];
      } else if (typeof datosError?.detalles === 'string') {
        mensaje = datosError.detalles;
      } else if (datosError?.non_field_errors) {
        mensaje = datosError.non_field_errors[0];
      }

      setError(mensaje);
      console.error(datosError);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-grande">
        <h2>{pedidoEditar ? 'Editar pedido' : 'Nuevo pedido'}</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Cliente</label>
          <select value={cliente} onChange={(e) => setCliente(e.target.value)} required>
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre_completo}</option>
            ))}
          </select>

          <label>Método de pago</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <label>Productos</label>
          {detalles.map((d, index) => (
            <div key={index} className="detalle-row">
              <select
                value={d.producto}
                onChange={(e) => actualizarDetalle(index, 'producto', e.target.value)}
                required
              >
                <option value="">Selecciona un producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={d.cantidad}
                onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                required
              />
              {detalles.length > 1 && (
                <button type="button" className="btn-icono btn-eliminar" onClick={() => quitarProducto(index)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn-secundario btn-agregar-producto" onClick={agregarProducto}>
            <Plus size={16} /> Agregar otro producto
          </button>

          <label>Notas</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />

          <div className="total-estimado">
            Total estimado: <strong>${calcularTotalEstimado()}</strong>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secundario" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PedidoForm;
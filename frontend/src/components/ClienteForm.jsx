import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function ClienteForm({ clienteEditar, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre_completo: '',
    telefono: '',
    correo: '',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (clienteEditar) {
      setForm({
        nombre_completo: clienteEditar.nombre_completo,
        telefono: clienteEditar.telefono || '',
        correo: clienteEditar.correo || '',
      });
    }
  }, [clienteEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      if (clienteEditar) {
        await api.put(`clientes/${clienteEditar.id}/`, form);
      } else {
        await api.post('clientes/', form);
      }
      onGuardado();
    } catch (err) {
      setError('No se pudo guardar el cliente. Revisa los campos.');
      console.error(err.response?.data);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{clienteEditar ? 'Editar cliente' : 'Nuevo cliente'}</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={handleChange}
            required
          />

          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
          />

          <div className="form-actions">
            <button type="button" className="btn-secundario" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClienteForm;
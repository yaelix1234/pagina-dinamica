import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function UsuarioForm({ usuarioEditar, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    cargo: 'empleado',
    estado: 'activo',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuarioEditar) {
      setForm({
        nombre: usuarioEditar.nombre,
        correo: usuarioEditar.correo,
        cargo: usuarioEditar.cargo,
        estado: usuarioEditar.estado,
      });
    }
  }, [usuarioEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      if (usuarioEditar) {
        await api.put(`usuarios/${usuarioEditar.id}/`, form);
      } else {
        await api.post('usuarios/', form);
      }
      onGuardado();
    } catch (err) {
      setError('No se pudo guardar el usuario. Revisa los campos.');
      console.error(err.response?.data);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{usuarioEditar ? 'Editar usuario' : 'Nuevo usuario'}</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />

          <label>Cargo</label>
          <select name="cargo" value={form.cargo} onChange={handleChange}>
            <option value="empleado">Empleado</option>
            <option value="administrador">Administrador</option>
          </select>

          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

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

export default UsuarioForm;
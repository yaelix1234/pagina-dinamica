import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function CategoriaForm({ categoriaEditar, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (categoriaEditar) {
      setForm({
        nombre: categoriaEditar.nombre,
        descripcion: categoriaEditar.descripcion || '',
      });
    }
  }, [categoriaEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      if (categoriaEditar) {
        await api.put(`categorias/${categoriaEditar.id}/`, form);
      } else {
        await api.post('categorias/', form);
      }
      onGuardado();
    } catch (err) {
      setError('No se pudo guardar la categoría. Revisa los campos.');
      console.error(err.response?.data);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{categoriaEditar ? 'Editar categoría' : 'Nueva categoría'}</h2>

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

          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
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

export default CategoriaForm;
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function ProductoForm({ productoEditar, categorias, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    existencias: '',
    estado: 'disponible',
    categoria: '',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (productoEditar) {
      setForm({
        nombre: productoEditar.nombre,
        descripcion: productoEditar.descripcion || '',
        precio: productoEditar.precio,
        existencias: productoEditar.existencias,
        estado: productoEditar.estado,
        categoria: productoEditar.categoria,
      });
    }
  }, [productoEditar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      if (productoEditar) {
        await api.put(`productos/${productoEditar.id}/`, form);
      } else {
        await api.post('productos/', form);
      }
      onGuardado();
    } catch (err) {
      setError('No se pudo guardar el producto. Revisa los campos.');
      console.error(err.response?.data);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{productoEditar ? 'Editar producto' : 'Nuevo producto'}</h2>

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

          <label>Precio</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            required
          />

          <label>Existencias</label>
          <input
            type="number"
            name="existencias"
            value={form.existencias}
            onChange={handleChange}
            required
          />

          <label>Categoría</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="disponible">Disponible</option>
            <option value="no_disponible">No disponible</option>
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

export default ProductoForm;
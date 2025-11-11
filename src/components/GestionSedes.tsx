import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string | null;
  imagen_fondo_url: string | null;
  activo: boolean;
  created_at: string;
}

const GestionSedes: React.FC = () => {
  const [sedesList, setSedesList] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    direccion: '',
    imagen_fondo_url: '',
    activo: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSedes();
  }, []);

  const loadSedes = async () => {
    try {
      const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setSedesList(data || []);
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      setError('Error al cargar las sedes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sede?: Sede) => {
    if (sede) {
      setEditingSede(sede);
      setFormData({
        nombre: sede.nombre,
        ciudad: sede.ciudad,
        direccion: sede.direccion || '',
        imagen_fondo_url: sede.imagen_fondo_url || '',
        activo: sede.activo
      });
    } else {
      setEditingSede(null);
      setFormData({
        nombre: '',
        ciudad: '',
        direccion: '',
        imagen_fondo_url: '',
        activo: true
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSede(null);
    setFormData({
      nombre: '',
      ciudad: '',
      direccion: '',
      imagen_fondo_url: '',
      activo: true
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre.trim() || !formData.ciudad.trim()) {
      setError('El nombre y la ciudad son obligatorios');
      return;
    }

    try {
      const sedeData = {
        nombre: formData.nombre.trim(),
        ciudad: formData.ciudad.trim(),
        direccion: formData.direccion.trim() || null,
        imagen_fondo_url: formData.imagen_fondo_url.trim() || null,
        activo: formData.activo
      };

      if (editingSede) {
        const { error } = await supabase
          .from('sedes')
          .update(sedeData)
          .eq('id', editingSede.id);

        if (error) throw error;
        setSuccess('Sede actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('sedes')
          .insert([sedeData]);

        if (error) throw error;
        setSuccess('Sede creada correctamente');
      }

      await loadSedes();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar la sede');
    }
  };

  const handleToggleActivo = async (sede: Sede) => {
    try {
      const { error } = await supabase
        .from('sedes')
        .update({ activo: !sede.activo })
        .eq('id', sede.id);

      if (error) throw error;
      
      setSuccess(`Sede ${!sede.activo ? 'activada' : 'desactivada'} correctamente`);
      await loadSedes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al cambiar estado de la sede');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (sede: Sede) => {
    if (!window.confirm(`¿Eliminar la sede "${sede.nombre}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sedes')
        .delete()
        .eq('id', sede.id);

      if (error) throw error;
      
      setSuccess('Sede eliminada correctamente');
      await loadSedes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar la sede');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando sedes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Sedes</h2>
          <p className="text-gray-400 mt-1">Administra las sedes y sus fondos de pantalla</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Sede</span>
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de Sedes */}
      {sedesList.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay sedes registradas</h3>
          <p className="text-gray-500">Crea tu primera sede para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedesList.map((sede) => (
            <div
              key={sede.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border ${
                sede.activo ? 'border-gray-700 hover:border-yellow-500' : 'border-gray-700 opacity-60'
              } transition-all shadow-lg`}
            >
              {/* Imagen de fondo */}
              <div className="h-48 overflow-hidden bg-gray-900 relative">
                {sede.imagen_fondo_url ? (
                  <img
                    src={sede.imagen_fondo_url}
                    alt={sede.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {!sede.activo && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">INACTIVO</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{sede.nombre}</h3>
                    <p className="text-gray-400 text-sm">{sede.ciudad}</p>
                    {sede.direccion && (
                      <p className="text-gray-500 text-xs mt-1">{sede.direccion}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sede.activo ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-gray-500 bg-opacity-20 text-gray-400'
                  }`}>
                    {sede.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(sede)}
                    className="flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActivo(sede)}
                    className={`flex-1 ${
                      sede.activo ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-500'
                    } text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium`}
                  >
                    {sede.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(sede)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingSede ? 'Editar Sede' : 'Nueva Sede'}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mensajes */}
              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nombre de la Sede *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="Ej: Campus Juliaca"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Ciudad *</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="Ej: Juliaca"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="Ej: Jr. Los Andes 123"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">URL de Imagen de Fondo</label>
                  <input
                    type="url"
                    value={formData.imagen_fondo_url}
                    onChange={(e) => setFormData({ ...formData, imagen_fondo_url: e.target.value })}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Esta imagen se mostrará como fondo en el header cuando se seleccione esta sede
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="activo" className="ml-2 text-gray-300">
                    Sede activa
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                >
                  {editingSede ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionSedes;
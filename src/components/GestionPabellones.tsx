import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Pabellon {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
}

interface Salon {
  id: number;
  pabellon_id: number;
  nombre: string;
  capacidad: number | null;
  descripcion: string | null;
}

const GestionPabellones: React.FC = () => {
  const [pabellones, setPabellones] = useState<Pabellon[]>([]);
  const [salones, setSalones] = useState<Record<number, Salon[]>>({});
  const [loading, setLoading] = useState(true);
  const [isModalPabellonOpen, setIsModalPabellonOpen] = useState(false);
  const [isModalSalonOpen, setIsModalSalonOpen] = useState(false);
  const [selectedPabellon, setSelectedPabellon] = useState<Pabellon | null>(null);
  const [editingPabellon, setEditingPabellon] = useState<Pabellon | null>(null);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formPabellon, setFormPabellon] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: ''
  });
  const [formSalon, setFormSalon] = useState({
    nombre: '',
    capacidad: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPabellones();
  }, []);

  const loadPabellones = async () => {
    try {
      const { data, error } = await supabase
        .from('pabellones')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPabellones(data || []);

      // Cargar salones de cada pabellón
      if (data) {
        for (const pabellon of data) {
          await loadSalones(pabellon.id);
        }
      }
    } catch (error) {
      console.error('Error al cargar pabellones:', error);
      setError('Error al cargar los pabellones');
    } finally {
      setLoading(false);
    }
  };

  const loadSalones = async (pabellonId: number) => {
    try {
      const { data, error } = await supabase
        .from('salones')
        .select('*')
        .eq('pabellon_id', pabellonId)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setSalones(prev => ({ ...prev, [pabellonId]: data || [] }));
    } catch (error) {
      console.error('Error al cargar salones:', error);
    }
  };

  // PABELLONES
  const handleOpenModalPabellon = (pabellon?: Pabellon) => {
    if (pabellon) {
      setEditingPabellon(pabellon);
      setFormPabellon({
        nombre: pabellon.nombre,
        descripcion: pabellon.descripcion || '',
        imagen_url: pabellon.imagen_url || ''
      });
    } else {
      setEditingPabellon(null);
      setFormPabellon({ nombre: '', descripcion: '', imagen_url: '' });
    }
    setIsModalPabellonOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitPabellon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formPabellon.nombre.trim()) {
      setError('El nombre del pabellón es requerido');
      return;
    }

    try {
      const pabellonData = {
        nombre: formPabellon.nombre.trim(),
        descripcion: formPabellon.descripcion.trim() || null,
        imagen_url: formPabellon.imagen_url.trim() || null
      };

      if (editingPabellon) {
        const { error } = await supabase
          .from('pabellones')
          .update(pabellonData)
          .eq('id', editingPabellon.id);

        if (error) throw error;
        setSuccess('Pabellón actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('pabellones')
          .insert([pabellonData]);

        if (error) throw error;
        setSuccess('Pabellón creado correctamente');
      }

      await loadPabellones();
      setTimeout(() => {
        setIsModalPabellonOpen(false);
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar el pabellón');
    }
  };

  const handleDeletePabellon = async (pabellon: Pabellon) => {
    if (!window.confirm(`¿Eliminar el pabellón "${pabellon.nombre}"? Se eliminarán también todos sus salones.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pabellones')
        .delete()
        .eq('id', pabellon.id);

      if (error) throw error;
      
      setSuccess('Pabellón eliminado correctamente');
      await loadPabellones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el pabellón');
      setTimeout(() => setError(''), 3000);
    }
  };

  // SALONES
  const handleOpenModalSalon = (pabellon: Pabellon, salon?: Salon) => {
    setSelectedPabellon(pabellon);
    if (salon) {
      setEditingSalon(salon);
      setFormSalon({
        nombre: salon.nombre,
        capacidad: salon.capacidad?.toString() || '',
        descripcion: salon.descripcion || ''
      });
    } else {
      setEditingSalon(null);
      setFormSalon({ nombre: '', capacidad: '', descripcion: '' });
    }
    setIsModalSalonOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formSalon.nombre.trim()) {
      setError('El nombre del salón es requerido');
      return;
    }

    if (!selectedPabellon) return;

    try {
      const salonData = {
        pabellon_id: selectedPabellon.id,
        nombre: formSalon.nombre.trim(),
        capacidad: formSalon.capacidad ? parseInt(formSalon.capacidad) : null,
        descripcion: formSalon.descripcion.trim() || null
      };

      if (editingSalon) {
        const { error } = await supabase
          .from('salones')
          .update(salonData)
          .eq('id', editingSalon.id);

        if (error) throw error;
        setSuccess('Salón actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('salones')
          .insert([salonData]);

        if (error) throw error;
        setSuccess('Salón creado correctamente');
      }

      await loadSalones(selectedPabellon.id);
      setTimeout(() => {
        setIsModalSalonOpen(false);
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar el salón');
    }
  };

  const handleDeleteSalon = async (salon: Salon) => {
    if (!window.confirm(`¿Eliminar el salón "${salon.nombre}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('salones')
        .delete()
        .eq('id', salon.id);

      if (error) throw error;
      
      setSuccess('Salón eliminado correctamente');
      await loadSalones(salon.pabellon_id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el salón');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Cargando pabellones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Pabellones y Salones</h2>
          <p className="text-gray-400 mt-1">Administra los pabellones y sus salones</p>
        </div>
        <button
          onClick={() => handleOpenModalPabellon()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Pabellón</span>
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

      {/* Lista de Pabellones */}
      {pabellones.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay pabellones registrados</h3>
          <p className="text-gray-500">Crea tu primer pabellón para comenzar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pabellones.map((pabellon) => (
            <div
              key={pabellon.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              {/* Header del Pabellón */}
              <div className="flex items-start p-6 border-b border-gray-700">
                {/* Imagen */}
                {pabellon.imagen_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-900 mr-4 flex-shrink-0">
                    <img
                      src={pabellon.imagen_url}
                      alt={pabellon.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/100?text=Sin+Imagen';
                      }}
                    />
                  </div>
                )}

                {/* Información */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{pabellon.nombre}</h3>
                  {pabellon.descripcion && (
                    <p className="text-gray-400 text-sm">{pabellon.descripcion}</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModalSalon(pabellon)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    + Salón
                  </button>
                  <button
                    onClick={() => handleOpenModalPabellon(pabellon)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletePabellon(pabellon)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Salones */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-300 mb-4">
                  Salones ({salones[pabellon.id]?.length || 0})
                </h4>

                {!salones[pabellon.id] || salones[pabellon.id].length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay salones en este pabellón</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {salones[pabellon.id].map((salon) => (
                      <div
                        key={salon.id}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-white text-lg">{salon.nombre}</h5>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleOpenModalSalon(pabellon, salon)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSalon(salon)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {salon.capacidad && (
                          <p className="text-gray-400 text-xs">
                            Capacidad: {salon.capacidad} personas
                          </p>
                        )}
                        {salon.descripcion && (
                          <p className="text-gray-500 text-xs mt-1">{salon.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Pabellón */}
      {isModalPabellonOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingPabellon ? 'Editar Pabellón' : 'Nuevo Pabellón'}
                </h3>
                <button
                  onClick={() => setIsModalPabellonOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmitPabellon} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Pabellón *
                  </label>
                  <input
                    type="text"
                    value={formPabellon.nombre}
                    onChange={(e) => setFormPabellon({ ...formPabellon, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Ej: Pabellón A, Pabellón B..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    value={formPabellon.imagen_url}
                    onChange={(e) => setFormPabellon({ ...formPabellon, imagen_url: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formPabellon.imagen_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Vista previa:</p>
                      <img
                        src={formPabellon.imagen_url}
                        alt="Vista previa"
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100?text=URL+inválida';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formPabellon.descripcion}
                    onChange={(e) => setFormPabellon({ ...formPabellon, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
                    placeholder="Descripción del pabellón..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalPabellonOpen(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    {editingPabellon ? 'Actualizar' : 'Crear Pabellón'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salón */}
      {isModalSalonOpen && selectedPabellon && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingSalon ? 'Editar Salón' : 'Nuevo Salón'}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{selectedPabellon.nombre}</p>
                </div>
                <button
                  onClick={() => setIsModalSalonOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmitSalon} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Salón *
                  </label>
                  <input
                    type="text"
                    value={formSalon.nombre}
                    onChange={(e) => setFormSalon({ ...formSalon, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    placeholder="Ej: A101, A102, A201..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacidad (personas)
                  </label>
                  <input
                    type="number"
                    value={formSalon.capacidad}
                    onChange={(e) => setFormSalon({ ...formSalon, capacidad: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                    placeholder="Ej: 30"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formSalon.descripcion}
                    onChange={(e) => setFormSalon({ ...formSalon, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white resize-none"
                    placeholder="Características del salón..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalSalonOpen(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {editingSalon ? 'Actualizar' : 'Crear Salón'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPabellones;
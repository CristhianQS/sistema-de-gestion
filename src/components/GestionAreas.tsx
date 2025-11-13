import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GestionCamposArea from './GestionCamposArea';
import SupabaseImageUploader from './SupabaseImageUploader';

interface Area {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

const GestionAreas: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para gestión de campos
  const [selectedAreaForFields, setSelectedAreaForFields] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      setError('Error al cargar las áreas');
    } finally {
      setLoading(false);
    }
  };

  // Si está gestionando campos de un área específica
  if (selectedAreaForFields) {
    return (
      <GestionCamposArea
        areaId={selectedAreaForFields.id}
        areaName={selectedAreaForFields.name}
        onClose={() => setSelectedAreaForFields(null)}
      />
    );
  }

  const handleOpenModal = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        description: area.description || '',
        image_url: area.image_url || ''
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        description: '',
        image_url: ''
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setFormData({ name: '', description: '', image_url: '' });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('El nombre del área es requerido');
      return;
    }

    if (!formData.description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!formData.image_url.trim()) {
      setError('La imagen es requerida');
      return;
    }

    try {
      const areaData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim()
      };

      if (editingArea) {
        const { error } = await supabase
          .from('areas')
          .update(areaData)
          .eq('id', editingArea.id);

        if (error) throw error;
        setSuccess('Área actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('areas')
          .insert([areaData]);

        if (error) throw error;
        setSuccess('Área creada correctamente');
      }

      await loadAreas();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar el área');
    }
  };

  const handleDelete = async (area: Area) => {
    if (!window.confirm(`¿Estás seguro de eliminar el área "${area.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', area.id);

      if (error) throw error;
      
      setSuccess('Área eliminada correctamente');
      await loadAreas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el área');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando áreas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Áreas</h2>
          <p className="text-gray-400 mt-1">Administra las áreas del sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Área</span>
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

      {/* Lista de Áreas */}
      {areas.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay áreas registradas</h3>
          <p className="text-gray-500">Crea tu primera área para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all shadow-lg"
            >
              {/* Imagen del área */}
              <div className="h-48 overflow-hidden bg-gray-900">
                <img
                  src={area.image_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                  alt={area.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error+al+cargar';
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{area.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {area.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Botón Gestionar Campos */}
                  <button
                    onClick={() => setSelectedAreaForFields({ id: area.id, name: area.name })}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Gestionar Campos</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(area)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(area)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingArea ? 'Editar Área' : 'Nueva Área'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Área *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Ej: Sistemas, Contabilidad, Recursos Humanos..."
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Ej: Sistemas, Contabilidad, Recursos Humanos..."
                    required
                  />
                </div>

                {/* NUEVO: Componente de Subida de Imágenes con Supabase */}
                <SupabaseImageUploader
                  currentImageUrl={formData.image_url}
                  onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                  onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
                  folder="areas"
                  label="Imagen del Área"
                  required
                  maxSizeMB={5}
                />

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-black px-4 py-3 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                  >
                    {editingArea ? 'Actualizar' : 'Crear'} Área
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

export default GestionAreas;
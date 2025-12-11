import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GestionCamposArea from './GestionCamposArea';
import SupabaseImageUploader from './SupabaseImageUploader';
import { FolderOpen, Plus, Edit2, Trash2, X, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { IMAGE_CONFIG } from '../constants';

interface Area {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

type ModalMode = 'create' | 'edit' | null;

const GestionAreas: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
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

  if (selectedAreaForFields) {
    return (
      <GestionCamposArea
        areaId={selectedAreaForFields.id}
        areaName={selectedAreaForFields.name}
        onClose={() => setSelectedAreaForFields(null)}
      />
    );
  }

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingArea(null);
    setFormData({
      name: '',
      description: '',
      image_url: ''
    });
    setError('');
    setSuccess('');
  };

  const handleOpenEditModal = (area: Area) => {
    setModalMode('edit');
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
      image_url: area.image_url || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingArea(null);
    setFormData({ name: '', description: '', image_url: '' });
    setError('');
    setSuccess('');
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('El nombre del área es obligatorio');
      return;
    }

    setSaving(true);

    try {
      const areaData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null
      };

      if (modalMode === 'edit' && editingArea) {
        const { error } = await supabase
          .from('areas')
          .update(areaData)
          .eq('id', editingArea.id);

        if (error) throw error;
        setSuccess('✅ Área actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('areas')
          .insert([areaData]);

        if (error) throw error;
        setSuccess('✅ Área creada correctamente');
      }

      await loadAreas();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (area: Area) => {
    try {
      const { data: users, error: checkError } = await supabase
        .from('admin_user')
        .select('id')
        .eq('area_id', area.id);

      if (checkError) throw checkError;

      if (users && users.length > 0) {
        setError(
          `No se puede eliminar el área "${area.name}" porque tiene ${users.length} usuario(s) asignado(s). ` +
          `Por favor, reasigna o elimina los usuarios primero.`
        );
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (!window.confirm(`¿Estás seguro de eliminar el área "${area.name}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
      }

      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', area.id);

      if (error) throw error;

      setSuccess('✅ Área eliminada correctamente');
      await loadAreas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);

      if (error.code === '23503') {
        setError(
          `No se puede eliminar el área "${area.name}" porque tiene usuarios asignados. ` +
          `Elimina o reasigna los usuarios primero.`
        );
      } else {
        setError(error.message || 'Error al eliminar el área');
      }

      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando áreas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-yellow-600" />
                Gestión de Áreas
              </h1>
              <p className="text-gray-600 mt-2">
                Administra las áreas del sistema de gestión
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-600/30"
            >
              <Plus className="w-5 h-5" />
              Nueva Área
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Lista de Áreas */}
        {areas.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay áreas registradas</h3>
            <p className="text-gray-500">Crea tu primera área para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-yellow-500 hover:shadow-lg transition-all"
              >
                {/* Imagen del área */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={area.image_url || IMAGE_CONFIG.PLACEHOLDER}
                    alt={area.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = IMAGE_CONFIG.ERROR_PLACEHOLDER;
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{area.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {area.description || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2">
                    {/* Botón Gestionar Campos */}
                    <button
                      onClick={() => setSelectedAreaForFields({ id: area.id, name: area.name })}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      Gestionar Campos
                    </button>

                    {/* Botones Editar y Eliminar */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(area)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
                        className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Crear/Editar */}
        {modalMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {modalMode === 'create' ? (
                    <>
                      <Plus className="w-6 h-6" />
                      Nueva Área
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-6 h-6" />
                      Editar Área
                    </>
                  )}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-yellow-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Área *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Ej: Mantenimiento, Tecnología, etc."
                    disabled={saving}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    placeholder="Describe brevemente el área..."
                    disabled={saving}
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    Imagen del Área
                  </label>

                  {/* Preview de imagen actual */}
                  {formData.image_url && (
                    <div className="mb-3 relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = IMAGE_CONFIG.ERROR_PLACEHOLDER;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Quitar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Uploader */}
                  <SupabaseImageUploader
                    onImageUploaded={handleImageUpload}
                    currentImageUrl={formData.image_url}
                    folder="area-images"
                  />
                </div>

                {/* Mensajes de error/éxito en el modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={saving}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {modalMode === 'create' ? 'Crear Área' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionAreas;
